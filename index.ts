import { Hono } from "hono";
import EmailObj, { EmailOpCode, EmailOpStatus } from "./email_obj";
import NonProfitObj, { OpCode, OpStatus } from "./nonprofit_obj";

const app = new Hono();

export const nonprofit_data = new NonProfitObj();
const email_sdk = new EmailObj();

app.post("/nonprofit/create", async (c) => {
  const body = await c.req.json();

  const result = nonprofit_data.add({
    name: String(body.name).trim(),
    email: String(body.email).trim(),
    address: String(body.address).trim(),
  });

  if (result.msg === OpStatus.ERROR_DUP) {
    c.status(303); //see other status code for duplicates
  }

  return c.json(result);
});

app.patch("/nonprofit/update", async (c) => {
  const body = await c.req.json();

  if (!body.email) {
    c.status(400);
    return c.json({ error: "Email is required" });
  }

  const hasUpdates = body.name || body.address || body.updated_email;
  if (!hasUpdates) {
    c.status(400);

    return c.json({
      operation: OpCode.UPDATE,
      msg: OpStatus.NO_FIELDS,
      non_profit: {
        ...body,
        name: "missing",
        address: "missing",
        updated_email: "missing",
      },
    });
  }

  const updateData = {
    name: body.name?.trim(),
    email: body.email.trim(),
    address: body.address?.trim(),
    updated_email: body.updated_email?.trim(),
  };

  const result = nonprofit_data.update(updateData.email, updateData);

  if (result.msg === OpStatus.NOT_FOUND) {
    c.status(404);
    return c.json(result);
  }

  c.status(200);
  return c.json(result);
});

app.post("/email/nonprofit/send/bulk", async (c) => {
  const body = await c.req.json();
  const email_template = body.email_template;
  const recipients = body.recipients;
  const subject = body.subject;

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
      recipeints: error_reps,
    };

    c.status(400);
    return c.json(op_result_error);
  }

  if (error_reps.length > 0) {
    const op_result_error = {
      operation: EmailOpCode.SEND_BULK,
      msg: EmailOpStatus.NOT_FOUND,
      recipeints: error_reps,
    };

    c.status(404);
    return c.json(op_result_error);
  }

  let template_variables = EmailObj.getTemplateVariables(email_template);

  let template_var_error = false;
  for (let templ_var of template_variables) {
    if (["name", "email", "address", "subject"].includes(templ_var) === false) {
      //would want to get this list of vars dynamically, not hard code
      template_var_error = true;
    }
  }

  if (template_var_error) {
    c.status(404);
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
  );

  if (mail_send_result.msg === EmailOpStatus.SUCCESS) {
    c.status(202);
  }

  return c.json(mail_send_result);
});

app.get("email/nonprofit/retrieve", async (c) => {});

export default app;
