const router = require("express").Router();
const Auth = require("../controllers/auth");
const { body } = require("express-validator");
const validate = require("../config/validate");
const Cart = require("../controllers/cart");

// Add product to cart
/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add a product to the cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "6651f9a21dcd13764ec3ab03"
 *                 description: The ID of the product
 *     responses:
 *       200:
 *         description: The updated cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/",
  Auth.isAuthenticated,
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Product ID must be a valid ID"),
  validate,
  Cart.addProduct
);

// Toggle Wallet
/**
 * @swagger
 * /cart/wallet:
 *   post:
 *     summary: Toggle the wallet
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               wallet:
 *                 type: boolean
 *                 description: The new status of the wallet
 *     responses:
 *       200:
 *         description: The updated cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/wallet",
  Auth.isAuthenticated,
  body("wallet")
    .notEmpty()
    .withMessage("Wallet ID is required")
    .isBoolean()
    .withMessage("Invalid status"),
  Cart.toggleWallet
);

module.exports = router;
