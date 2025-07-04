import { Hono } from "hono";
import EmailObj, { EmailOpCode, EmailOpStatus } from "./email_obj";
import NonProfitObj, { OpCode, OpStatus } from "./nonprofit_obj";

const app = new Hono();

export const nonprofit_data = new NonProfitObj();
const email_sdk = new EmailObj();

app.post("/nonprofit/create", async (c) => {
  const body = await c.req.json();

  const get_result = nonprofit_data.get(String(body.email).trim());

  if (get_result) {
    c.status(409);
    return c.json({
      operation: OpCode.CREATE,
      msg: OpStatus.ERROR_DUP,
      non_profit: get_result,
    });
  }

  const result = nonprofit_data.add({
    name: String(body.name).trim(),
    email: String(body.email).trim(),
    address: String(body.address).trim(),
  });

  c.status(201);
  return c.json(result);
});

app.post("/email/nonprofit/send/bulk", async (c) => {
  const body = await c.req.json();
  const email_template = body.email_template;
  const recipients = body.recipients;
  const subject = body.subject;
  const sender = body.sender;

  const all_nonprofits = nonprofit_data.get_all();
  const error_reps = [];

  for (const rec of recipients) {
    const found = all_nonprofits.get(rec);
    if (found === undefined) {
      error_reps.push(rec);
    }
  }

  if (subject === undefined) {
    const op_result_error = {
      operation: EmailOpCode.SEND_BULK,
      msg: EmailOpStatus.MISSING_SUBJECT,
    };

    c.status(400);
    return c.json(op_result_error);
  }

  if (sender === undefined) {
    const op_result_error = {
      operation: EmailOpCode.SEND_BULK,
      msg: EmailOpStatus.MISSING_SENDER,
    };

    c.status(400);
    return c.json(op_result_error);
  }

  if (error_reps.length > 0) {
    const op_result_error = {
      operation: EmailOpCode.SEND_BULK,
      msg: EmailOpStatus.NOT_FOUND,
      recipients: error_reps,
    };

    c.status(404);
    return c.json(op_result_error);
  }

  let template_variables = EmailObj.getTemplateVariables(email_template);

  let template_var_error = false;
  for (let templ_var of template_variables) {
    console.log(templ_var);
    if (
      ["name", "email", "address", "subject", "sender"].includes(templ_var) ===
      false
    ) {
      //would want to get this list of vars dynamically, not hard code
      template_var_error = true;
    }
  }

  if (template_var_error) {
    c.status(400);
    return c.json({
      operation: EmailOpCode.SEND_BULK,
      msg: EmailOpStatus.INVALID_VARS,
      recipients: recipients,
    });
  }

  const mail_send_result = email_sdk.send_email(
    recipients,
    email_template,
    subject,
    sender,
  );

  if (mail_send_result.msg === EmailOpStatus.SUCCESS) {
    c.status(202);
  }

  return c.json(mail_send_result);
});

app.get("/email/nonprofit/retrieve/:email", async (c) => {
  let email = c.req.param("email");

  const emails_get = email_sdk.get_emails_by_email_key(email);

  if (emails_get === undefined) {
    c.status(404);
    return c.json({
      operation: EmailOpCode.GET_ALL_EMAILS,
      msg: EmailOpStatus.EMAIL_NOT_FOUND,
      email: email,
    });
  }

  c.status(200);
  return c.json({
    operation: EmailOpCode.GET_ALL_EMAILS,
    msg: EmailOpStatus.SUCCESS,
    query_params: email,
    query_result: emails_get,
  });
});

export default app;
