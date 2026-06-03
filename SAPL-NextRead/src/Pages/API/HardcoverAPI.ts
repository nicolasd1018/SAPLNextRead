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


// const client = ...
export const test = () => {
    client
    .query({
        query: gql`
        query MyQuery {
            books (where: {_and: [{title: {_eq: "Watership Down"}}, {users_read_count: {_gt: 0}}]})
            {
                user_books (where: {rating: {_gte: 4}}){
                user{
                    user_books (where: {rating: {_gte: 4}}){
                    book{
                        title
                        contributions{author{name}}
                        # description
                        image {
                        url
                        }
                    }
                    }
                }
                }
            }
    }
    `,
        errorPolicy: 'all'
    })
    .then((result) => console.log(result));
}