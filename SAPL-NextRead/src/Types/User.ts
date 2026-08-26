import BookList from "./bookList";
import UseState from "./UseState";

export default interface User {
    id: number
    useState: UseState;
    userName: string;
    password?: string;
    searchLists: BookList[];
    profilePicture?: string;
}