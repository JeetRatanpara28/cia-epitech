import { IOrder } from "../models/order.interface";
import { api } from "./account.actions";

export const GET_ORDERS: string = "GET_ORDERS";
export const ADD_ORDER: string = "ADD_ORDER";

const { instance, bearer } = api;

export function getOrders(): any {
    return async (dispatch: any) => {
        try {
            const response = await instance.get('/order', { headers: bearer() });
            dispatch({ type: GET_ORDERS, orders: response.data });
        } catch (e) {
            console.log(e);
        }
    };
}

export function addOrder(order: IOrder): any {
    return async (dispatch: any) => {
        try {
            const payload = {
                name: order.name,
                productId: order.product.id,
                amount: order.amount,
            };
            const response = await instance.post('/order', payload, { headers: bearer() });
            dispatch({ type: ADD_ORDER, order: response.data });
        } catch (e) {
            console.log(e);
        }
    };
}

interface IAddOrderActionType { type: string, order: IOrder }
