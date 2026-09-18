import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { re } from "mathjs";
import Tag from "../Types/Tag";

const authLink = new SetContextLink(({ headers }) => {
  return {
    headers: {
      ...headers,
      authorization:  `Bearer hc_pat_BrQDfdhfiboCRdEmMhJHdDXDEqfqBwGZFoaE5nUfHQp8`,
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(new HttpLink({ uri: "https://api.hardcover.app/v1/graphql" })),
  cache: new InMemoryCache(),
});

interface response {
    books: {user_books: {user: {user_books: {book: book}[]}}[]}[]
}

export interface book {
    id: number
    image: {url: string }
    title: string
    contributions: {author: {name:string, is_bipoc: boolean, is_lgbtq: boolean}}[]
    description: string
    subtitle: string
    book_series: {position: number, series: {name: string, books_count: number}}[]
    genres: {tag: {tag: string}}[]
    contentWarnings: {tag: {tag: string}}[]
    moods: {tag: {tag: string}}[]
    ageRating: string
}

export const getListBooks = async (bookList: string[], bannedBooks: string[], bipocFilter: boolean, lgbtqFilter:boolean, iteration?: number) => {
    var reccomendation: book[] =  [];
    let list = '';
    let bannedList = ''
    
    bookList.forEach((book) => { 
                                    list += `{title: {_eq: "${book}"}},`;
                                    bannedList += `{book: {title: {_neq: "${book}"}}},`;
                                });
    
    bannedBooks.forEach((book)=> bannedList += `{book: {title: {_neq: "${book}"}}},`);
    console.log(list, bannedList)
    await client
    .query({
        query: gql`
        fragment cover on books
        {
        image {
                            url
                }
        }

        fragment information on books{
        id
        title
        subtitle
        contributions{author
            {name
            is_bipoc
            is_lgbtq
            }}
        description
        book_series {
            position
            series {
            name
            books_count
            }
        }
        }

        fragment genres on books{
        genres: taggable_counts(where: {tag: {tag_category_id: {_eq: 1}}}order_by: {count: desc_nulls_last} limit: 5){
                tag{
                    tag
                }
            }
        }

        fragment contentWarnings on books {
        contentWarnings: taggable_counts(where: {tag: {tag_category_id: {_eq: 3}}}order_by: {count: desc_nulls_last}){
                tag{
                    tag
                }
            }
        }

        fragment moods on books{
            moods: taggable_counts(where: {tag: {tag_category_id: {_eq: 4}}}order_by: {count: desc_nulls_last} limit: 5){
                tag{
                    tag
                }
            }
        }

        query MyQuery {
            books (where: {_and: [{_or: [${list}]}, {users_read_count: {_gt: 0}}]})
            {
                user_books (where: {rating: {_gte: 4}}
                            ${iteration ? `offset: ${10* iteration}` : ''} limit: 10){
                user{
                    user_books (where:{_and: [{rating: {_gte: 4}}, ${bannedList}${bipocFilter ? ", {book: {contributions: {author: {is_bipoc: {_eq: true}}}}}": ''}${lgbtqFilter ? ", {book: {contributions: {author: {is_lgbtq: {_eq: true}}}}}": ''}]}
                                order_by: {rating: desc}
      
                                 limit: 5){
                    book {
                        ...cover
                        ...information
                        ...genres
                        ...contentWarnings
                        ...moods
                    }
                    }
                }
                }
            }
    }
    `,
        errorPolicy: 'all'
    }).then((result) => { 
        console.log(result);
        if ((result.data as response).books.length ===0 ) {
            reccomendation = []
        }
        else
         reccomendation = [...new Set((result.data as response).books.filter((a)=> a.user_books.length !== 0)[0].user_books.map((ub)=> ub.user).map((u)=>u.user_books).flat().map((b)=> b.book))];
    })
    .catch((error)=>console.log(error));
    return  reccomendation;
}

export const getAuthorBooks = async (author: string, bipocFilter: boolean, lgbtqFilter:boolean, iteration?: number) => {
    let searchBooks: book[] = [];
    await client
    .query({
        query: gql`
        query MySearchQuery {
  search(
    query: "${author}"
    query_type: "Book"
    per_page: 5
    sort: "activities_count:desc"
  ) {
    results
  }
}
    `,
        errorPolicy: 'all'
    }).then((result) => { 
        if ((result.data as {search: {results: {hits: {document: {}}[]}}}).search.results.hits.length === 0) {
            searchBooks = [];
        }
        else {
         const searchResults = (result.data as {search: {results: {hits: {document: {id: number, image: {url: string}, title: string, contributions: {author: {name:string, is_bipoc: boolean, is_lgbtq: boolean}}[], description: string, subtitle: string, featured_series: {position: number, series: {primary_books_count: number, name: string }}, genres:string[], content_warnings: string[], moods: string[]}}[]}}}).search.results.hits;
         searchResults.forEach((hit)=> {
            const searchResult = hit.document;
            searchBooks = [...searchBooks, {...searchResult, book_series: searchResult.featured_series.series ? [{position: searchResult.featured_series.position, series: {name: searchResult.featured_series.series.name, books_count: searchResult.featured_series.series.primary_books_count}}] : [], genres: searchResult.genres.map((genre)=> {return {tag: {tag: genre}}}), contentWarnings: searchResult.content_warnings.map((contentWarning)=> {return {tag: {tag: contentWarning}}}), moods: searchResult.moods.map((mood)=> {return {tag: {tag: mood}}}), ageRating: '' }];
        });
        
        }
    })
    .catch((error)=>console.log(error));
    const reccomendation = await getListBooks(searchBooks.map((book)=> book.title), [], bipocFilter, lgbtqFilter, iteration )
    return  reccomendation;
}

export const getBook = async (title: string) => {
    let book: book | undefined = undefined;
    await client
    .query({
        query: gql`
        query MySearchQuery {
  search(
    query: "${title}"
    query_type: "Book"
    per_page: 1
    sort: "activities_count:desc"
  ) {
    results
  }
}
    `,
        errorPolicy: 'all'
    }).then((result) => { 
        if ((result.data as {search: {results: {hits: {document: {}}[]}}}).search.results.hits.length === 0) {
            book = undefined;
            console.log('test');
        }
        else {
         const searchResult = (result.data as {search: {results: {hits: {document: {id: number, image: {url: string}, title: string, contributions: {author: {name:string, is_bipoc: boolean, is_lgbtq: boolean}}[], description: string, subtitle: string, featured_series: {position: number, series: {primary_books_count: number, name: string }}, genres:string[], content_warnings: string[], moods: string[]}}[]}}}).search.results.hits[0].document;
         book = {...searchResult, book_series: searchResult.featured_series.series ? [{position: searchResult.featured_series.position, series: {name: searchResult.featured_series.series.name, books_count: searchResult.featured_series.series.primary_books_count}}] : [], genres: searchResult.genres.map((genre)=> {return {tag: {tag: genre}}}), contentWarnings: searchResult.content_warnings.map((contentWarning)=> {return {tag: {tag: contentWarning}}}), moods: searchResult.moods.map((mood)=> {return {tag: {tag: mood}}}), ageRating: '' }
        }
    })
    .catch((error)=>console.log(error));
    return  book;
}

export const getRecommendations = async (title: string, bipocFilter: boolean, lgbtqFilter:boolean, iteration?: number): Promise<book[]>=> {
    var reccomendation: book[] =  [];
    await client
    .query({
        query: gql`
        fragment cover on books
        {
        image {
                            url
                }
        }

        fragment information on books{
        id
        title
        subtitle
        contributions{author
            {name
            is_bipoc
            is_lgbtq
            }}
        description
        book_series {
            position
            series {
            name
            books_count
            }
        }
        }

        fragment genres on books{
        genres: taggable_counts(where: {tag: {tag_category_id: {_eq: 1}}}order_by: {count: desc_nulls_last} limit: 5){
                tag{
                    tag
                }
            }
        }

        fragment contentWarnings on books {
        contentWarnings: taggable_counts(where: {tag: {tag_category_id: {_eq: 3}}}order_by: {count: desc_nulls_last}){
                tag{
                    tag
                }
            }
        }

        fragment moods on books{
            moods: taggable_counts(where: {tag: {tag_category_id: {_eq: 4}}}order_by: {count: desc_nulls_last} limit: 5){
                tag{
                    tag
                }
            }
        }

        query MyQuery {
            books (where: {_and: [{title: {_eq: "${title}"}}, {users_read_count: {_gt: 0}}]})
            {
                user_books (where: {rating: {_gte: 4}}
                            ${iteration ? `offset: ${10* iteration}` : ''} limit: 10){
                user{
                    user_books (where:{_and: [{rating: {_gte: 4}}, {book: {title: {_neq: "${title}"}}}${bipocFilter ? ", {book: {contributions: {author: {is_bipoc: {_eq: true}}}}}": ''}${lgbtqFilter ? ", {book: {contributions: {author: {is_lgbtq: {_eq: true}}}}}": ''}]}
                                order_by: {rating: desc}
      
                                 limit: 5){
                    book {
                        ...cover
                        ...information
                        ...genres
                        ...contentWarnings
                        ...moods
                    }
                    }
                }
                }
            }
    }
    `,
        errorPolicy: 'all'
    }).then((result) => { 
        if ((result.data as response).books.length ===0 ) {
            reccomendation = []
        }
        else
         reccomendation = [...new Set((result.data as response).books.filter((a)=> a.user_books.length !== 0)[0].user_books.map((ub)=> ub.user).map((u)=>u.user_books).flat().map((b)=> b.book))];
    })
    .catch((error)=>console.log(error));
    return  reccomendation;
}

export const getAllGenres = async (iteration: number = 0) =>{
    let tags: {data: {tags: {tag: string}[]}} = await client
    .query({
        query: gql`
        query MyQuery {
            tags(where: {tag_category_id: {_eq: 1}}, order_by: {count: desc_nulls_last} offset:${50*iteration} limit: 50 ) {
                tag
            }
        }
        `, errorPolicy: 'all'}) as {data: {tags: {tag: string}[]}};
    return tags.data.tags.map((tag)=> tag.tag);
}

export const getAllContentWarnings = async (iteration: number = 0) =>{
    let tags: {data: {tags: {tag: string}[]}} = await client
    .query({
        query: gql`
        query MyQuery {
            tags(where: {tag_category_id: {_eq: 3}}, order_by: {count: desc_nulls_last} offset:${50*iteration} limit: 50 ) {
                tag
            }
        }
        `, errorPolicy: 'all'}) as {data: {tags: {tag: string}[]}};
    return tags.data.tags.map((tag)=> tag.tag);
}

export const getAllMoods = async (iteration: number = 0) =>{
    let tags: {data: {tags: {tag: string}[]}} = await client
    .query({
        query: gql`
        query MyQuery {
            tags(where: {tag_category_id: {_eq: 4}}, order_by: {count: desc_nulls_last} offset:${50*iteration} limit: 50 ) {
                tag
            }
        }
        `, errorPolicy: 'all'}) as {data: {tags: {tag: string}[]}};
    return tags.data.tags.map((tag)=> tag.tag);
}