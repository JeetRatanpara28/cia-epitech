import axios from "axios";
import Cookies from "js-cookie";
import {addNotification} from "./notifications.action";

export const LOG_IN: string = "LOG_IN";
export const REGISTER: string = "REGISTER";
export const LOG_OUT: string = "LOG_OUT";

function apiUrl(): string {
    const raw = process.env.REACT_APP_API_URL || 'localhost:3000';
    if (/^https?:\/\//i.test(raw)) return raw;
    const scheme = (typeof window !== 'undefined'
        && window.location.protocol === 'https:') ? 'https' : 'http';
    return `${scheme}://${raw}`;
}

function saveToken(value: string) {
    Cookies.set('token', value, {
        secure: typeof window !== 'undefined'
            && window.location.protocol === 'https:',
        sameSite: 'strict',
        expires: 15 / (24 * 60),
    });
}
function readToken(): string | undefined { return Cookies.get('token'); }
function dropToken() { Cookies.remove('token'); }

const instance = axios.create({
    baseURL: apiUrl(),
    timeout: 5000,
    headers: {}
});
function bearer(): {Authorization?: string} {
    const t = readToken();
    return t ? {Authorization: `Bearer ${t}`} : {};
}

function axiosError(e: unknown): any {
    return e as any;
}

export function me(): any {
    return async (dispatch : any) => {
        try {
            const response = await instance.get('/auth/me', {headers: bearer()});
            return dispatch({type: LOG_IN, email: response.data.username});
        } catch (e) {
            const err = axiosError(e);
            if (err.response === undefined) {
                return dispatch(addNotification("Error", err.message));
            }
            return dispatch(addNotification("Error", "Session expired"));
        }
    }
}

export function login(email: string, password: string): any {
    return async (dispatch : any) => {
        try {
            const response = await instance.post('/auth/login', {
                username: email,
                password: password
            });
            saveToken(response.data.token);
            return dispatch({type: LOG_IN, email: email});
        } catch (e) {
            const err = axiosError(e);
            if (err.response === undefined) {
                return dispatch(addNotification("Error", err.message));
            }
            const msg = err.response.data?.error || err.response.data || 'Login failed';
            return dispatch(addNotification("Error", msg));
        }
    }
}

export function register(email: string, password: string): any {
    return async (dispatch : any) => {
        try {
            const response = await instance.post('/auth/register', {
                username: email,
                password: password
            });
            dispatch(addNotification("Success", response.data));
            return dispatch({type: REGISTER});
        } catch (e) {
            const err = axiosError(e);
            if (err.response === undefined) {
                return dispatch(addNotification("Error", err.message));
            }
            if (err.response.data && err.response.data.length !== undefined) {
                return dispatch(addNotification("Error", err.response.data[0].constraints.length));
            }
            return dispatch(addNotification("Error", err.response.data));
        }
    }
}

export function logout(): ILogOutActionType {
    dropToken();
    return { type: LOG_OUT};
}

interface ILogInActionType { type: string, email: string }
interface ILogOutActionType { type: string }

export const api = {apiUrl, bearer, instance};
