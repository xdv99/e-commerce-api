const router = require("express").Router();
const Auth = require("../controllers/auth");
const Order = require("../controllers/order");
const { param, query, body } = require("express-validator");
const validate = require("../config/validate");

// Get Order with filter
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get orders with filter
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user
 *         in: query
 *         description: The user ID
 *         schema:
 *           type: string
 *           format: mongoId
 *       - name: delivery
 *         in: query
 *         description: The delivery ID
 *         schema:
 *           type: string
 *           format: mongoId
 *       - name: status
 *         in: query
 *         description: The status of the order (pending, accepted, rejected, delivered)
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [pending, accepted, rejected, delivered]
 *       - name: page
 *         in: query
 *         description: The page number
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - name: timeMin
 *         in: query
 *         description: The minimum time
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: timeMax
 *         in: query
 *         description: The maximum time
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: sortBy
 *         in: query
 *         description: The field to sort by
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 nxtPage:
 *                   type: integer
 *                   description: The next page number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/",
  Auth.isAuthenticated,
  query("user").optional().isMongoId().withMessage("Invalid ID"),
  query("delivery").optional().isMongoId().withMessage("Invalid ID"),
  query("status")
    .optional()
    .customSanitizer((value) => {
      const statuses = value.split(",").map((status) => status.trim());
      const valid = ["pending", "accepted", "rejected", "delivered"];
      const invalid = statuses.filter((status) => !valid.includes(status));
      if (invalid.length > 0) throw new Error("Invalid status");
      return statuses;
    }),
  query("page")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Page must be a number"),
  query("sortBy").optional().isString().withMessage("Invalid sort"),
  query("timeMin").optional().isISO8601().withMessage("Invalid date"),
  query("timeMax").optional().isISO8601().withMessage("Invalid date"),
  validate,
  Order.get
);

// Check Order
/**
 * @swagger
 * /orders/check:
 *   get:
 *     summary: Check order to provide a statement
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The order is ready to be checked out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cart is empty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message
 *                   default: Cart is empty
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: The cart has been modified due to either a product removed or quantity changed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/check", Auth.isAuthenticated, Order.check);

// Get Order By ID
/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: The ID of the order
 *         required: true
 *     responses:
 *       200:
 *         description: The order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message
 *                   default: Invalid ID
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message
 *                   default: Forbidden
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/:id",
  Auth.isAuthenticated,
  param("id")
    .isMongoId()
    .withMessage("Invalid ID")
    .notEmpty()
    .withMessage("ID is required"),
  validate,
  Order.getById
);

// Create Order
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: The order is created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: The cart has been modified due to either a product removed or quantity changed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/", Auth.isAuthenticated, Order.create);

// Update Status
/**
 * @swagger
 * /orders/status/{id}:
 *   patch:
 *     summary: Update the status of an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected, delivered]
 *               delivery:
 *                 type: string
 *                 format: mongoId
 *     responses:
 *       200:
 *         description: The order status is updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User is not delivery man
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message
 *                   default: User is not a delivery
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch(
  "/status/:id",
  Auth.isDeliveryOrManager,
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isMongoId()
    .withMessage("Invalid ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "accepted", "rejected", "delivered"])
    .withMessage("Invalid status"),
  body("delivery").optional().isMongoId().withMessage("Invalid ID"),
  validate,
  Order.updateStatus
);

module.exports = router;
