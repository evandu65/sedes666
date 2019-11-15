[logo]: https://github.com/evandu65/sedes666/blob/master/docs/img/sedes-logo.png "SEDES"
![alt text](https://github.com/evandu65/sedes666/blob/master/docs/img/sedes-logo.png "Logo Title Text 1")
# sedes666 - quae sedes in solio 

A benches' reference RESTful API implemented with [Express]


## Requirements

* [Node.js][node] 12.x
* [MongoDB][mongo] 4.x


## Usage

```bash
git clone https://github.com/evandu65/sedes666.git
cd sedes666
npm ci
DEBUG=demo:* npm start
```
Visit [http://localhost:3000](http://localhost:3000).

To automatically reload the code and re-generate the API documentation on changes, use `npm run dev` instead of `npm start`.


## Configuration

The app will attempt to connect to the MongoDB database at `mongodb://localhost/sedes666 by default.

Use the `$DATABASE_URL` or the `$MONGODB_URI` environment variables to specify a different connection URL.


## Resources

This API allows you to work with **Users**, **Benches** and **Votes**:

* A **Bench** MUST have one **User** (who is a Person)

Read the [full documentation][docs] to know more.



[docs]: https://sedes666.herokuapp.com/
[express]: https://expressjs.com
[mongo]: https://www.mongodb.com
[node]: https://nodejs.org/
