import BookList from "./bookList";
import UseState from "./UseState";

export default interface User {
    useState: UseState;
    userName: string;
    salt?: string;
    password?: string;
    searchLists: BookList[];
    profilePicture?: string;
}