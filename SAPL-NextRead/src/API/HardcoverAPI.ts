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
// const client = ...

export const getBook = async (title: string) => {
    let book: book | undefined = undefined;
    await client
    .query({
        query: gql`
        fragment cover on books {
  image {
    url
  }
}

fragment information on books {
  id
  title
  subtitle
  contributions {
    author {
      name
      is_bipoc
      is_lgbtq
    }
  }
  description
  book_series {
    position
    series {
      name
      books_count
    }
  }
}

fragment genres on books {
  genres: taggable_counts(
    where: {tag: {tag_category_id: {_eq: 1}}}
    order_by: {count: desc_nulls_last}
    limit: 5
  ) {
    tag {
      tag
    }
  }
}

fragment contentWarnings on books {
  contentWarnings: taggable_counts(
    where: {tag: {tag_category_id: {_eq: 3}}}
    order_by: {count: desc_nulls_last}
  ) {
    tag {
      tag
    }
  }
}

fragment moods on books {
  moods: taggable_counts(
    where: {tag: {tag_category_id: {_eq: 4}}}
    order_by: {count: desc_nulls_last}
    limit: 5
  ) {
    tag {
      tag
    }
  }
}

query MyQuery {
  books(
    where: {_and: [{title: {_eq: "${title}"}}, {users_read_count: {_gt: 0}}]}
    order_by: {users_read_count: desc}
    limit: 1
  ) {
    ...cover
    ...information
    ...genres
    ...contentWarnings
    ...moods
  }
}

    `,
        errorPolicy: 'all'
    }).then((result) => { 
        if ((result.data as {books: book[]}).books.length ===0) {
            book = undefined
        }
        else
         book = (result.data as { books:book[]}).books[0];
        console.log((result.data as { books: book[]}).books[0]);
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