import {validate} from 'class-validator';
import {Request, Response} from 'express';
import {AppDataSource} from '../data-source';
import {Product} from '../entity/Product';

class ProductController {
  public static listAll = async (req: Request, res: Response) => {
    const productRepository = AppDataSource.getRepository(Product);
    const products = await productRepository.find();
    res.send(products);
  };

  public static getOneById = async (req: Request, res: Response) => {
    const id: number = parseInt(String(req.params.id), 10);
    const productRepository = AppDataSource.getRepository(Product);
    try {
      const product = await productRepository.findOneOrFail({where: {id}});
      res.send(product);
    } catch (error) {
      res.status(404).send('Product not found');
    }
  };

  public static create = async (req: Request, res: Response) => {
    const {name, category, description, amount, price, hasExpiryDate} = req.body;
    const product = new Product();
    product.name = name;
    product.category = category;
    product.description = description || '';
    product.amount = amount;
    product.price = price;
    product.hasExpiryDate = hasExpiryDate ?? false;

    const errors = await validate(product);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    const productRepository = AppDataSource.getRepository(Product);
    try {
      const saved = await productRepository.save(product);
      res.status(201).send(saved);
    } catch (e) {
      res.status(409).send('product already exists');
    }
  };

  public static edit = async (req: Request, res: Response) => {
    const id: number = parseInt(String(req.params.id), 10);
    const productRepository = AppDataSource.getRepository(Product);
    let product: Product;
    try {
      product = await productRepository.findOneOrFail({where: {id}});
    } catch (error) {
      res.status(404).send('Product not found');
      return;
    }

    const {name, category, description, amount, price, hasExpiryDate} = req.body;
    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (amount !== undefined) product.amount = amount;
    if (price !== undefined) product.price = price;
    if (hasExpiryDate !== undefined) product.hasExpiryDate = hasExpiryDate;

    const errors = await validate(product, {skipMissingProperties: true});
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    await productRepository.save(product);
    res.status(204).send();
  };

  public static remove = async (req: Request, res: Response) => {
    const id: number = parseInt(String(req.params.id), 10);
    const productRepository = AppDataSource.getRepository(Product);
    try {
      await productRepository.findOneOrFail({where: {id}});
      await productRepository.delete(id);
    } catch (error) {
      res.status(404).send('Product not found');
      return;
    }
    res.status(204).send();
  };
}

export default ProductController;
