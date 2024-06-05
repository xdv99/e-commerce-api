const router = require("express").Router();
const Auth = require("../controllers/auth");
const Product = require("../controllers/product");
const { query, body, param } = require("express-validator");
const validate = require("../config/validate");
const multer = require("multer");
const { join, extname } = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(__dirname, "..", "public", "products"));
  },
  filename: function (req, file, cb) {
    cb(null, `product${Date.now()}${extname(file.originalname)}`);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Only jpeg and png files are allowed"), false);
    }
  },
  preservePath: true,
});

// Get products with filters
/**
 * @swagger
 * /products:
 *  get:
 *    summary: Get products
 *    tags:
 *      - Products
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        description: Page number
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *        description: Product name
 *      - in: query
 *        name: category
 *        schema:
 *          type: string
 *        description: Product category
 *      - in: query
 *        name: minPrice
 *        schema:
 *          type: integer
 *        description: Minimum price
 *      - in: query
 *        name: maxPrice
 *        schema:
 *          type: integer
 *        description: Maximum price
 *      - in: query
 *        name: minAmount
 *        schema:
 *          type: integer
 *        description: Minimum amount
 *      - in: query
 *        name: maxAmount
 *        schema:
 *          type: integer
 *        description: Maximum amount
 *      - in: query
 *        name: minOrders
 *        schema:
 *          type: integer
 *        description: Minimum orders
 *      - in: query
 *        name: maxOrders
 *        schema:
 *          type: integer
 *        description: Maximum orders
 *      - in: query
 *        name: expire
 *        schema:
 *          type: string
 *          format: date-time
 *        description: Expiration date
 *      - in: query
 *        name: sortBy
 *        schema:
 *          type: string
 *        description: Sort by
 *    responses:
 *      200:
 *        description: Successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                results:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Product'
 *                nxtPage:
 *                  type: integer
 *                  description: The next page number
 *      400:
 *        $ref: '#/components/responses/BadRequest'
 *      401:
 *        $ref: '#/components/responses/Unauthorized'
 *      500:
 *        $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/",
  query("page")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Page must be a number"),
  query("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 25 })
    .withMessage("Name must be between 3 and 25 characters"),
  query("category").optional().isString().withMessage("Invalid category"),
  query("minPrice").optional().isInt({ min: 0 }).withMessage("Invalid price"),
  query("maxPrice").optional().isInt({ min: 0 }).withMessage("Invalid price"),
  query("minAmount").optional().isInt({ min: 0 }).withMessage("Invalid amount"),
  query("maxAmount").optional().isInt({ min: 0 }).withMessage("Invalid amount"),
  query("minOrders").optional().isInt({ min: 0 }).withMessage("Invalid orders"),
  query("maxOrders").optional().isInt({ min: 0 }).withMessage("Invalid orders"),
  query("expire").optional().isISO8601().withMessage("Invalid date"),
  query("sortBy").optional().isString().withMessage("Invalid sort"),
  validate,
  Product.getProducts
);

// Get product
/**
 * @swagger
 * /products/{id}:
 *  get:
 *    summary: Get a product by ID
 *    tags:
 *      - Products
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        description: The ID of the product
 *        required: true
 *    responses:
 *      200:
 *        description: The product
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 *      400:
 *        $ref: '#/components/responses/BadRequest'
 *      401:
 *        $ref: '#/components/responses/Unauthorized'
 *      404:
 *        $ref: '#/components/responses/NotFound'
 *      500:
 *        $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/:id",
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isMongoId()
    .withMessage("Invalid ID"),
  validate,
  Product.getProduct
);

// Add product
/**
 * @swagger
 * /products:
 *  post:
 *    summary: Add a new product
 *    tags:
 *      - Products
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Product'
 *    responses:
 *      '200':
 *        description: Successful response
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 *      '400':
 *        $ref: '#/components/responses/BadRequest'
 *      '401':
 *        $ref: '#/components/responses/Unauthorized'
 *      '500':
 *        $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/",
  Auth.isManager,
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 60 })
    .withMessage("Name must be between 3 and 60 characters"),
  body("category")
    .optional()
    .isArray()
    .withMessage("Category must be an array"),
  body("category.*").isString().withMessage("Category must be a string"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isObject()
    .withMessage("Price must be an object"),
  body(["price.org", "price.net"])
    .notEmpty()
    .withMessage("Price details missing")
    .isNumeric({ min: 0 })
    .withMessage("Invalid price"),
  body("price.discount")
    .optional()
    .isNumeric({ min: 0 })
    .withMessage("Invalid discount"),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isInt({ min: 0 })
    .withMessage("Amount must be a number"),
  body("image").optional().isString().withMessage("Image must be a string"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("nutrition")
    .optional()
    .isObject()
    .withMessage("Nutrition must be an object"),
  body([
    "nutrition.protein",
    "nutrition.fat",
    "nutrition.carb, nutrition.calories",
  ])
    .optional()
    .isNumeric()
    .withMessage("Nutrition details must be a number"),
  body("timestamp")
    .optional()
    .isObject()
    .withMessage("Timestamp must be an object"),
  body(["timestamp.production", "timestamp.Date"])
    .optional()
    .isISO8601()
    .withMessage("Invalid date"),
  body("timestamp.expTxt").optional().isString().withMessage("Invalid text"),
  validate,
  Product.addProduct
);

// Update product
/**
 * @swagger
 * /products/{id}:
 *  put:
 *    summary: Update product
 *    tags: [Products]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        description: The id of the product
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Product'
 *    responses:
 *      200:
 *        description: Successful response
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Product not found
 *      500:
 *        description: Internal server error
 */
router.put(
  "/:id",
  Auth.isManager,
  param("id")
    .isMongoId()
    .withMessage("Invalid ID")
    .notEmpty()
    .withMessage("ID is required"),
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 60 })
    .withMessage("Name must be between 3 and 60 characters"),
  body("category")
    .optional()
    .isArray()
    .withMessage("Category must be an array"),
  body("category.*").isString().withMessage("Category must be a string"),
  body("price").optional().isObject().withMessage("Price must be an object"),
  body(["price.org", "price.net"])
    .optional()
    .isNumeric({ min: 0 })
    .withMessage("Invalid price"),
  body("price.discount")
    .optional()
    .isNumeric({ min: 0 })
    .withMessage("Invalid discount"),
  body("amount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Amount must be a number"),
  body("image").optional().isString().withMessage("Image must be a string"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("nutrition")
    .optional()
    .isObject()
    .withMessage("Nutrition must be an object"),
  body([
    "nutrition.protein",
    "nutrition.fat",
    "nutrition.carb, nutrition.calories",
  ])
    .optional()
    .isNumeric()
    .withMessage("Nutrition details must be a number"),
  body("timestamp")
    .optional()
    .isObject()
    .withMessage("Timestamp must be an object"),
  body(["timestamp.production", "timestamp.Date"])
    .optional()
    .isISO8601()
    .withMessage("Invalid date"),
  body("timestamp.expTxt").optional().isString().withMessage("Invalid text"),
  validate,
  Product.updateProduct
);

// Delete Product
/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   default: Product deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
  "/:id",
  Auth.isManager,
  param("id")
    .isMongoId()
    .withMessage("Invalid ID")
    .notEmpty()
    .withMessage("ID is required"),
  validate,
  Product.deleteProduct
);

// Upload product image
/**
 * @swagger
 * /products/img:
 *  post:
 *    summary: Upload product image
 *    tags: [Products]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              image:
 *                type: string
 *                format: binary
 *    responses:
 *      201:
 *        description: Successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                image:
 *                  type: string
 *                  description: The file name of the uploaded image
 *                  example: product1716718421145.webp
 *      400:
 *        $ref: '#/components/responses/BadRequest'
 *      401:
 *        $ref: '#/components/responses/Unauthorized'
 *      500:
 *        $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/img",
  Auth.isOwnerOrManger,
  upload.single("image"),
  Product.uploadProductImg
);

module.exports = router;
