const fs = require('fs');
const express = require('express');
const { mainModule } = require('process');
const port = 8000;
const app = express();

const { stringify } = require('querystring');
app.use(express.json());

// get products+filter by saerch title and category and price
app.get('/products', (req, res) => {
	const { category, minPrice, maxPrice, title } = req.query;
	fs.readFile('./products.json', 'utf8', (err, data) => {
		let products = JSON.parse(data);
		if (category && minPrice && maxPrice) {
			products = products.filter(
				(product) =>
					product.category.toLocaleLowerCase() ===
						category.toLocaleLowerCase() &&
					product.price > +minPrice &&
					product.price < +maxPrice
			);
			res.send(products);
		}
		if (category) {
			products = products.filter(
				(product) =>
					product.category.toLowerCase() === category.toLowerCase()
			);
			res.send(products);
		}
		if (minPrice) {
			products = products.filter((product) => product.price > +minPrice);
			res.send(products);
		}
		if (maxPrice) {
			products = products.filter((product) => product.price < +maxPrice);
			res.send(products);
		}
		if (title) {
			products = products.filter((product) =>
				product.title.toLowerCase().includes(title.toLowerCase())
			);
			res.send(products);
		}
	});
});

//get specific product by id from the link
app.get('/products/:id', (req, res) => {
	const id = +req.params.id;
	fs.readFile('./products.json', 'utf8', (err, data) => {
		const products = JSON.parse(data);
		const product = products.find((product) => product.id === id);
		res.send(product);
	});
});
//delete product by id
app.delete('/products/:id', (req, res) => {
	const { id } = req.params;
	fs.readFile('./products.json', 'utf8', (err, data) => {
		const products = JSON.parse(data);
		const productIndex = products.findIndex(
			(product) => product.id === +id
		);
		products.splice(productIndex, 1);
		fs.writeFile('./products.json', JSON.stringify(products), (err) => {
			res.send(products);
		});
	});
});

//update product by id or title
app.put('/products/:id', (req, res) => {
	const { id } = req.params;
	const { title, price, description, category, image, rating } = req.body;

	fs.readFile('./products.json', 'utf8', (err, data) => {
		let products = JSON.parse(data);
		const productIndex = products.findIndex(
			(product) => product.id === +id
		);
		if (price) {
			products[productIndex].price = price;
		}
		if (title) {
			products[productIndex].title = title;
		}
		fs.writeFile('./products.json', JSON.stringify(products), (err) => {
			res.send(products[productIndex]);
		});
	});
});
//create new product
app.post('/products', (req, res) => {
	const { title, description, category, image, price } = req.body;
	const product = new Product({ title, description, category, image, price });
	product.save((err, product) => {
		res.send(product);
	});
	fs.readFile('./products.json', 'utf8', (err, data) => {
		const products = JSON.parse(data);
		let id = products.length + 1;
		let rating = { rate: 0, count: 0 };
		const newProduct = {
			id,
			title,
			description,
			category,
			image,
			price,
			rating,
		};
		products.push(newProduct);
		fs.writeFile('./products.json', JSON.stringify(products), (err) => {
			res.send(newProduct);
		});
	});
});

app.listen(port, () => {
	console.log(`app listen in port ${port}`);
});
