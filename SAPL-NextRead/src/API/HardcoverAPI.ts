import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { re } from "mathjs";

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
    genres: {tag: {tag: string}}[]
    contentWarnings: {tag: {tag: string}}[]
    moods: {tag: {tag: string}}[]
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
                    user_books (where:{_and: [{rating: {_gte: 4}}, {book: {title: {_neq: "${title}"}}}]}
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