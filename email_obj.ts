import Handlebars from "handlebars";
import { nonprofit_data } from "./index";

interface EmailObject {
  email_recipient: string;
  email_messages: {
    recipient: string;
    sender: string;
    subject: string;
    template: string;
    body: string;
    timestamp: string;
  }[];
}

export enum EmailOpCode {
  SEND_BULK = "send:bulk",
  GET_ALL_EMAILS = "get all emails",
}

export enum EmailOpStatus {
  SUCCESS = "success",
  NOT_FOUND = "error: recipient(s) not found",
  EMAIL_NOT_FOUND = "error: no emails sent to this user",
  MISSING_SUBJECT = "error: missing subject",
  MISSING_SENDER = "error: missing sender",
  INVALID_VARS = "error: invalid template variables",
}

class EmailObj {
  private email_obj_data: Map<
    EmailObject["email_recipient"],
    EmailObject["email_messages"]
  >;

  constructor() {
    this.email_obj_data = new Map();
  }

  static getTemplateVariables(template: string) {
    const matches = template.match(/\{([^}]+)\}/g);
    if (!matches) return [];
    const variables = matches.map((match) => match.slice(1, -1).trim());
    return [...new Set(variables)]; // Simpler, order may vary
  }

  public get_emails_by_email_key(email_key: string) {
    return this.email_obj_data.get(email_key);
  }

  public send_email(
    recipients: [string],
    body: string,
    subject: string,
    sender: string,
  ) {
    const np_data = nonprofit_data.get_all();

    for (let recipient of recipients) {
      const non_profit = np_data.get(recipient);

      const template = Handlebars.compile(
        "Sending money to nonprofit {{ name }} at address {{ address }}", //!!!!!NOTE: replace with 'body' variable
      );
      const template_match = template({
        ...non_profit,
        subject,
      });

      let email_rec_obj = this.email_obj_data.get(recipient);
      let new_email = {
        recipient: recipient,
        sender: sender,
        subject: subject,
        template: body,
        body: template_match,
        timestamp: new Date().toISOString(),
      };

      if (email_rec_obj === undefined) {
        let email_list_new = [];
        email_list_new.push(new_email);
        this.email_obj_data.set(recipient, email_list_new);
      } else {
        email_rec_obj.push(new_email);
      }
    }

    return {
      operation: EmailOpCode.SEND_BULK,
      msg: EmailOpStatus.SUCCESS,
      recipients: recipients,
    };
  }
}

export default EmailObj;
