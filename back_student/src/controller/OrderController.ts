import {validate} from 'class-validator';
import {Request, Response} from 'express';
import {AppDataSource} from '../data-source';
import {Order} from '../entity/Order';
import {Product} from '../entity/Product';

class OrderController {
  public static listAll = async (req: Request, res: Response) => {
    const orderRepository = AppDataSource.getRepository(Order);
    const orders = await orderRepository.find();
    res.send(orders);
  };

  public static create = async (req: Request, res: Response) => {
    const {name, productId, amount} = req.body;
    if (!name || !productId || !amount) {
      res.status(400).send({error: 'name, productId and amount are required'});
      return;
    }

    const productRepository = AppDataSource.getRepository(Product);
    let product: Product;
    try {
      product = await productRepository.findOneOrFail({where: {id: parseInt(productId, 10)}});
    } catch (error) {
      res.status(404).send({error: 'product not found'});
      return;
    }

    const qty = parseInt(amount, 10);
    if (product.amount < qty) {
      res.status(400).send({error: 'insufficient stock'});
      return;
    }

    const order = new Order();
    order.name = name;
    order.product = product;
    order.amount = qty;
    order.totalPrice = product.price * qty;

    const errors = await validate(order);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    product.amount -= qty;
    await productRepository.save(product);

    const orderRepository = AppDataSource.getRepository(Order);
    const saved = await orderRepository.save(order);
    res.status(201).send(saved);
  };
}

export default OrderController;
