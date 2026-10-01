import { book } from "../API/HardcoverAPI"

export default interface Author {
    name:string, 
    title: string,
    alternate_names: string[],
    bio: string,
    books_count: number,
    born_date: string,
    death_date: string,
    location: string,
    books?: book[],
    is_bipoc: boolean, 
    is_lgbtq: boolean, 
    image: {url: string}
}