import Tag from "./Tag";

export default interface UseState {
    whiteList: Tag[],
    blackList: Tag[],
    ageRange: string[],
    bipocFilter: boolean,
    lgbtqFilter: boolean
}  