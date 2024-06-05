/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - phone
 *       properties:
 *         _id:
 *           type: ObjectId
 *           description: The auto-generated id of the user
 *         phone:
 *           type: string
 *           description: The phone number of the user starting with +964
 *         name:
 *           type: string
 *           description: The name of the user
 *         location:
 *           type: object
 *           description: Object representing the location of the user
 *           properties:
 *             address:
 *               type: string
 *               description: The address of the user
 *             gps:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                   description: The latitude of the user
 *                 lng:
 *                   type: number
 *                   description: The longitude of the user
 *             distance:
 *               type: number
 *               description: The distance of the user from the market in kilometers
 *             duration:
 *               type: number
 *               description: The expected time to deliver the order in minutes
 *         wallet:
 *           type: number
 *           description: The wallet balance of the user
 *         orders:
 *           type: number
 *           description: The number of orders the user has made
 *         spent:
 *           type: number
 *           description: The total amount spent by the user
 *         role:
 *           type: string
 *           enum: ["admin", "user", "deliver", "manager"]
 *           description: The role of the user
 *         cart:
 *           type: object
 *           description: Object representing the cart of the user
 *           properties:
 *             products:
 *               type: array
 *               description: Array of products in the cart
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *             coupon:
 *               type: ObjectId
 *               description: The coupon Id used in the cart
 *       example:
 *         phone: "+9647801234567"
 *         name: "John Doe"
 *         location:
 *           address: "حي الشرطة مقابل باب الملعب"
 *           gps:
 *             lat: 123.456
 *             lng: 456.789
 *           distance: 10
 *           duration: 30
 *         wallet: 3000
 *         orders: 2
 *         spent: 12000
 *         role: "user"
 *         cart:
 *           products: [
 *             {
 *               _id: 123,
 *               name: "Product 1",
 *               price: {
 *                 org: 100,
 *                 net: 90
 *               },
 *               image: "image.jpg",
 *               description: "Product 1 description"
 *             }
 *           ]
 *           coupon: null
 */
/**
 * @swagger
 * components:
 *   schemas:
 *    Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: ObjectId
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         price:
 *           type: object
 *           required:
 *             - org
 *             - net
 *           description: The price of the product
 *           properties:
 *             org:
 *               type: number
 *               description: The original price of the product
 *             net:
 *               type: number
 *               description: The net price of the product
 *             discount:
 *               type: number
 *               description: The discount percentage of the product
 *         image:
 *           type: string
 *           description: The image url of the product
 *         description:
 *           type: string
 *           description: The description of the product
 *         amount:
 *           type: number
 *           description: The amount of the product in stock
 *         orders:
 *           type: number
 *           description: The number of orders the product has made
 *         category:
 *           type: array
 *           description: The category of the product
 *           items:
 *             type: string
 *             description: The category of the product
 *         nutrition:
 *           type: object
 *           description: The nutrition of the product
 *           properties:
 *             protein:
 *               type: number
 *               description: The protein of the product
 *             fat:
 *               type: number
 *               description: The fat of the product
 *             carb:
 *               type: number
 *               description: The carb of the product
 *             calories:
 *               type: number
 *               description: The calories of the product
 *             timestamp:
 *               type: Date
 *               description: The timestamp of the product
 *         finalPrice:
 *           type: number
 *           description: The final price of the product
 *       example:
 *         id: 6651f9a21dcd13764ec3ab03
 *         name: "Product 1"
 *         price:
 *           org: 100
 *           net: 90
 *         image: "image.jpg"
 *         description: "Product 1 description"
 *         amount: 10
 *         orders: 0
 *         category: ["Category 1", "Category 2"]
 *         nutrition:
 *           protein: 10
 *           fat: 20
 *           carb: 30
 *           calories: 40
 *         finalPrice: 90
 *         timestamp: "2022-01-01T00:00:00.000Z"
 */
/**
 * @swagger
 * components:
 *   schemas:
 *    Coupon:
 *       type: object
 *       required:
 *         - code
 *         - value
 *       properties:
 *         id:
 *           type: ObjectId
 *           description: The auto-generated id of the coupon
 *         code:
 *           type: string
 *           description: The name of the coupon
 *         value:
 *           type: number
 *           description: The discount percentage of the coupon
 *         limit:
 *           type: number
 *           description: Limit of times the coupon can be used
 *         used:
 *           type: number
 *           description: The number of times the coupon has been used
 *         expire:
 *           type: date
 *           description: The expiration date of the coupon
 *         isActive:
 *           type: boolean
 *           description: Whether the coupon is active or not
 *       example:
 *         code: "Coupon 1"
 *         value: 10
 *         limit: 10
 *         used: 0
 *         expire: "2022-01-01T00:00:00.000Z"
 *         isActive: true
 */
/**
 * @swagger
 * components:
 *   schemas:
 *    Order:
 *       type: object
 *       required:
 *         - user
 *         - products
 *         - cost
 *       properties:
 *         id:
 *           type: ObjectId
 *           description: The auto-generated id of the order
 *         user:
 *           type: ObjectId
 *           description: The id of the user
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: ObjectId
 *                 required: true
 *                 description: The id of the product
 *               quantity:
 *                 type: number
 *                 required: true
 *                 description: The quantity of the product
 *           description: The products in the order
 *         cost:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               required: true
 *               description: The total price of the order
 *             profit:
 *               type: number
 *               required: true
 *               description: The net profit of the order
 *             delivery:
 *               type: number
 *               description: The delivery cost of the order
 *             wallet:
 *               type: number
 *               description: Money subtracted from wallet
 *             coupon:
 *               type: number
 *               description: The coupon cost of the order
 *         state:
 *             type: string
 *             enum: ["pending", "accepted", "rejected", "delivered"]
 *             default: "pending"
 *             description: The state of the order
 *         timestamp:
 *             type: Date
 *             description: The timestamp of the order
 *         finalCost:
 *           type: number
 *           description: The final cost of the order
 *       example:
 *         user: 123
 *         products:
 *         - product: 123
 *           quantity: 2
 *         cost:
 *           total: 100
 *           profit: 90
 *           delivery: 10
 *           wallet: 20
 *           coupon: 5
 *         state: "pending"
 *         finalCost: 90
 *         timestamp: "2022-01-01T00:00:00.000Z"
 */
/**
 * @swagger
 * components:
 *   schemas:
 *    Cart:
 *       type: object
 *       properties:
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: ObjectId
 *                 description: The id of the product
 *               quantity:
 *                 type: number
 *                 description: The quantity of the product
 *           description: The products in the cart
 *         coupon:
 *           type: ObjectId
 *           description: The id of the coupon
 *         wallet:
 *           type: boolean
 *           description: Whether to use wallet for the order
 *       example:
 *         products:
 *         - product: "6651f9a21dcd13764ec3ab03"
 *           quantity: 2
 *         - product: "6651fa8f1dcd13764ec3ab07"
 *           quantity: 3
 *         coupon: "6651fa921dcd13764ec3ab0b"
 *         wallet: true
 */
/**
 * @swagger
 * components:
 *   responses:
 *     BadRequest:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       default: field
 *                       description: The error type
 *                     msg:
 *                       type: string
 *                       description: The error message
 *                       example: "The name field is required"
 *                     path:
 *                       type: string
 *                       description: Field name
 *                       example: name
 *                     location:
 *                       type: string
 *                       description: The location of the error
 *                       example: body
 *     Unauthorized:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 default: Unauthorized
 *                 description: The error message
 *     InternalServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 description: The error message
 *                 default: Internal Server Error
 *     NotFound:
 *       description: Not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 description: The error message
 *                 default: Item Not Found
 */
