import { IUser } from "../models/user.interface";
import { api } from "./account.actions";

export const ADD_ADMIN: string = "ADD_ADMIN";
export const GET_USERS: string = "GET_USERS";
export const REMOVE_ADMIN: string = "REMOVE_ADMIN";

const {instance, bearer} = api;

export function addAdmin(user: IUser): any {
    return async (dispatch : any) => {
        try {
            await instance.patch('/user/' + user.id,
                {username: user.username, role: "ADMIN"},
                {headers: bearer()},
            );
            return dispatch({type: ADD_ADMIN, user});
        } catch (e) {
            console.log(e);
        }
    };
}

export function removeAdmin(user: IUser): (dispatch: any) => Promise<any> {
    return async (dispatch : any) => {
        try {
            await instance.patch('/user/' + user.id,
                {username: user.username, role: "NORMAL"},
                {headers: bearer()},
            );
            return dispatch({type: REMOVE_ADMIN, user});
        } catch (e) {
            console.log(e);
        }
    };
}

export function getUsers(): any {
    return async (dispatch : any) => {
        try {
            const response = await instance.get('/user', {headers: bearer()});
            const tmpUsers: IUser[] = response.data;
            const users: IUser[] = [];
            const admins: IUser[] = [];
            tmpUsers.forEach((u: IUser) => {
                if (u.role === "ADMIN") admins.push(u);
                else users.push(u);
            });
            return dispatch({type: GET_USERS, admins, users});
        } catch (e) {
            console.log(e);
        }
    };
}
