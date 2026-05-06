import { transporter } from "../config/mailer";

const formatBudget = (value?: number) => {
    if (!value) return "-";

    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
    }).format(value);
};

const formatDate = (value?: Date) => {
    if (!value) return "-";

    return new Intl.DateTimeFormat("es-ES").format(new Date(value));
};

export const sendCustomerCustomRequestConfirmation = async (customRequest: any) => {
    await transporter.sendMail({
        from: `"Reimii 3D" <${process.env.MAIL_CUSTOMER_FROM}>`,
        to: customRequest.email,
        subject: "Hemos recibido tu solicitud personalizada - Reimii 3D",
        html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a;">
        <h1>Gracias por tu solicitud, ${customRequest.name}</h1>

        <p>
          Hemos recibido correctamente tu solicitud personalizada en
          <strong>Reimii 3D</strong>.
        </p>

        <p>
          Revisaremos los detalles de tu proyecto y te contactaremos pronto
          con una respuesta o presupuesto.
        </p>

        <h2>Resumen de tu solicitud</h2>

        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
          <tbody>
            <tr>
              <td><strong>Tipo de proyecto</strong></td>
              <td>${customRequest.type || "-"}</td>
            </tr>
            <tr>
              <td><strong>Tamaño preferido</strong></td>
              <td>${customRequest.size || "-"}</td>
            </tr>
            <tr>
              <td><strong>Presupuesto</strong></td>
              <td>${formatBudget(customRequest.budget)}</td>
            </tr>
            <tr>
              <td><strong>Fecha límite</strong></td>
              <td>${formatDate(customRequest.deadline)}</td>
            </tr>
          </tbody>
        </table>

        <h2>Descripción</h2>
        <p>${customRequest.description}</p>

        <p style="margin-top: 32px;">
          Gracias por confiar en Reimii 3D.
        </p>
      </div>
    `
    });
};

export const sendAdminCustomRequestNotification = async (customRequest: any) => {
    await transporter.sendMail({
        from: `"Reimii 3D Custom" <${process.env.MAIL_ADMIN_FROM}>`,
        to: process.env.SHOP_EMAIL,
        subject: `Nueva solicitud personalizada - ${customRequest.name}`,
        html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a;">
        <h1>Nueva solicitud personalizada</h1>

        <h2>Cliente</h2>
        <p>
          Nombre: <strong>${customRequest.name}</strong><br />
          Email: <strong>${customRequest.email}</strong><br />
          Teléfono: <strong>${customRequest.phone || "-"}</strong>
        </p>

        <h2>Detalles del proyecto</h2>

        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
          <tbody>
            <tr>
              <td><strong>Tipo</strong></td>
              <td>${customRequest.type || "-"}</td>
            </tr>
            <tr>
              <td><strong>Tamaño</strong></td>
              <td>${customRequest.size || "-"}</td>
            </tr>
            <tr>
              <td><strong>Presupuesto</strong></td>
              <td>${formatBudget(customRequest.budget)}</td>
            </tr>
            <tr>
              <td><strong>Fecha límite</strong></td>
              <td>${formatDate(customRequest.deadline)}</td>
            </tr>
            <tr>
              <td><strong>Estado</strong></td>
              <td>${customRequest.status}</td>
            </tr>
          </tbody>
        </table>

        <h2>Descripción</h2>
        <p>${customRequest.description}</p>
      </div>
    `
    });
};