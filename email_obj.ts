import Handlebars from "handlebars";
import { nonprofit_data } from "./index";

interface EmailObject {
  email_recipient: string;
  email_messages: {
    sender: string;
    subject: string;
    template: string;
    body: string;
    timestamp: string;
  }[];
}

export enum EmailOpCode {
  SEND_BULK = "send:bulk",
  GETALL = "get all",
}

export enum EmailOpStatus {
  SUCCESS = "success",
  NOT_FOUND = "error: recipients not found",
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
