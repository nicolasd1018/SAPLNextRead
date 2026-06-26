import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const authLink = new SetContextLink(({ headers }) => {
  return {
    headers: {
      ...headers,
      authorization:  `Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJIYXJkY292ZXIiLCJ2ZXJzaW9uIjoiOCIsImp0aSI6IjIxMzczZTA0LTU0MzEtNDA0Yy05MzVlLWFlOTdlNmM4ZjVkZiIsImFwcGxpY2F0aW9uSWQiOjIsInN1YiI6Ijk3MDU2IiwiYXVkIjoiMSIsImlkIjoiOTcwNTYiLCJsb2dnZWRJbiI6dHJ1ZSwiaWF0IjoxNzgwNDk5MzI3LCJleHAiOjE4MTIwMzUzMjcsImh0dHBzOi8vaGFzdXJhLmlvL2p3dC9jbGFpbXMiOnsieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS1yb2xlIjoidXNlciIsIlgtaGFzdXJhLXVzZXItaWQiOiI5NzA1NiJ9LCJ1c2VyIjp7ImlkIjo5NzA1Nn19.fy1_BHNy-z22-Soi30dDtgOYGUVuHjjxCxDjlk_zbx4`,
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
    contributions: {author: {name:string}}[]
    description: string
    subtitle: string
    genres: {tag: {tagName: string}}[]
}
// const client = ...
export const getRecommendations = async (title: string, iteration?: number): Promise<book[]>=> {
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
        contributions{author{name}}
        description
        }

        query MyQuery {
            books (where: {_and: [{title: {_eq: "${title}"}}, {users_read_count: {_gt: 0}}]})
            {
                user_books (where: {rating: {_gte: 4}}
                            ${iteration ? `offset: ${10* iteration}` : ''} limit: 10){
                user{
                    user_books (where:{_and: [{rating: {_gte: 4}}, {book: {title: {_neq: "${title}"}}}]}
                                order_by: {rating: desc}
      
                                 limit: 5){
                    book {
                        ...cover
                        ...information
                    }
                    }
                }
                }
            }
    }
    `,
        errorPolicy: 'all'
    }).then((result) => { 
        reccomendation = [...new Set((result.data as response).books.filter((a)=> a.user_books.length !== 0)[0].user_books.map((ub)=> ub.user).map((u)=>u.user_books).flat().map((b)=> b.book))];
    })
    return reccomendation
}

export const getGenres = async ( bookID: number) => {
    let genres: string[] = [];
    await client
    .query({
        query: gql`
        {
        books(where: {id: {_eq: ${bookID}}}){
            taggable_counts(where: {tag: {tag_category_id: {_eq: 1}}}order_by: {count: desc_nulls_last} limit: 5){
            tag{
                tag
            }
            }
        }
        }`
    }).then((result) => {
        genres = [...(result.data as {books: {taggable_counts: {tag: {tag: string}}[]}[]}).books[0].taggable_counts.map((taggable_counts)=>taggable_counts.tag.tag)].sort();
    });
    return genres;
} 
