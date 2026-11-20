import BookList from "./bookList";
import UseState from "./UseState";

export default interface User {
    id: number
    useState: UseState;
    userName: string;
    searchLists: BookList[];
    profilePicture?: string;
    allowedToUseData: boolean;
    bookRatingThreshold: number;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    gender: string;
}