import { transporter } from "../config/mailer";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
    }).format(value);
};

export const sendCustomerOrderConfirmation = async (order: any) => {
    const itemsHtml = order.items
        .map(
            (item: any) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${item.color || "-"}</td>
          <td>${item.size || "-"}</td>
          <td>${formatCurrency(item.subtotal)}</td>
        </tr>
      `
        )
        .join("");

    await transporter.sendMail({
        from: `"Reimii 3D" <${process.env.MAIL_CUSTOMER_FROM}>`,
        to: order.email,
        subject: "Confirmación de tu pedido - Reimii 3D",
        html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a;">
        <h1>Gracias por tu pedido, ${order.customerName}</h1>

        <p>Hemos recibido correctamente tu compra en <strong>Reimii 3D</strong>.</p>

        <h2>Resumen del pedido</h2>

        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
          <thead>
            <tr style="background: #0f172a; color: white;">
              <th align="left">Producto</th>
              <th align="left">Cantidad</th>
              <th align="left">Color</th>
              <th align="left">Tamaño</th>
              <th align="left">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <h2>Total</h2>
        <p>Subtotal: <strong>${formatCurrency(order.subtotal)}</strong></p>
        <p>Envío: <strong>${order.shippingCost === 0 ? "Gratis" : formatCurrency(order.shippingCost)}</strong></p>
        <p>Total pagado: <strong>${formatCurrency(order.total)}</strong></p>

        <h2>Dirección de envío</h2>
        <p>
          ${order.shippingAddress.fullName}<br />
          ${order.shippingAddress.addressLine1}<br />
          ${order.shippingAddress.addressLine2 || ""}<br />
          ${order.shippingAddress.postalCode}, ${order.shippingAddress.city}<br />
          ${order.shippingAddress.province}, ${order.shippingAddress.country}
        </p>

        <p>Te avisaremos cuando tu pedido esté en preparación o haya sido enviado.</p>

        <p style="margin-top: 32px;">Gracias por confiar en Reimii 3D.</p>
      </div>
    `
    });
};

export const sendAdminOrderNotification = async (order: any) => {
    const itemsHtml = order.items
        .map(
            (item: any) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${item.color || "-"}</td>
          <td>${item.size || "-"}</td>
          <td>${formatCurrency(item.unitPrice)}</td>
          <td>${formatCurrency(item.subtotal)}</td>
        </tr>
      `
        )
        .join("");

    await transporter.sendMail({
        from: `"Reimii 3D Orders" <${process.env.MAIL_ADMIN_FROM}>`,
        to: process.env.SHOP_EMAIL,
        subject: `Nuevo pedido pagado - ${order.customerName}`,
        html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a;">
        <h1>Nuevo pedido pagado</h1>

        <h2>Cliente</h2>
        <p>
          Nombre: <strong>${order.customerName}</strong><br />
          Email: <strong>${order.email}</strong><br />
          Teléfono: <strong>${order.phone || "-"}</strong>
        </p>

        <h2>Productos</h2>

        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
          <thead>
            <tr style="background: #0f172a; color: white;">
              <th align="left">Producto</th>
              <th align="left">Cantidad</th>
              <th align="left">Color</th>
              <th align="left">Tamaño</th>
              <th align="left">Precio</th>
              <th align="left">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <h2>Importes</h2>
        <p>Subtotal: <strong>${formatCurrency(order.subtotal)}</strong></p>
        <p>Envío: <strong>${order.shippingCost === 0 ? "Gratis" : formatCurrency(order.shippingCost)}</strong></p>
        <p>Total: <strong>${formatCurrency(order.total)}</strong></p>

        <h2>Dirección de envío</h2>
        <p>
          ${order.shippingAddress.fullName}<br />
          ${order.shippingAddress.addressLine1}<br />
          ${order.shippingAddress.addressLine2 || ""}<br />
          ${order.shippingAddress.postalCode}, ${order.shippingAddress.city}<br />
          ${order.shippingAddress.province}, ${order.shippingAddress.country}
        </p>

        <h2>Pago</h2>
        <p>
          Método: Stripe<br />
          Estado: ${order.status}<br />
          Stripe Session: ${order.stripeSessionId}
        </p>
      </div>
    `
    });
};