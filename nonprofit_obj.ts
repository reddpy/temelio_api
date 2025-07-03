interface NonProfitData {
  name: string;
  email: string;
  address: string;
}

interface NonProfitDataUpdate {
  name?: string;
  updated_email?: string;
  address?: string;
}

export enum OpCode {
  GET = "get",
  CREATE = "create",
  UPDATE = "update",
  GETALL = "get all",
}

export enum OpStatus {
  SUCCESS = "success",
  ERROR_DUP = "error: duplicate exists",
  NOT_FOUND = "error: nonprofit not found",
  NO_CHANGE = "error: no data change detected",
  NO_FIELDS = "error: no fields to update provided",
}

class NonProfitObj {
  private non_profit_obj: Map<string, NonProfitData>;

  constructor() {
    this.non_profit_obj = new Map();
  }

  private pure_set(np_data: NonProfitData) {
    this.non_profit_obj.set(np_data.email, np_data);
  }

  public get(email_key: string) {
    const found_obj = this.non_profit_obj.get(email_key);
    return found_obj !== undefined ? found_obj : undefined;
  }

  public add(added_np_data: NonProfitData) {
    const email_key = added_np_data.email;
    const get_result = this.get(email_key);

    if (get_result) {
      return {
        operation: OpCode.CREATE,
        msg: OpStatus.ERROR_DUP,
        non_profit: get_result,
      };
    }

    this.pure_set(added_np_data);
    return {
      operation: OpCode.CREATE,
      msg: OpStatus.SUCCESS,
      non_profit: this.get(added_np_data.email),
    };
  }

  public remove(email_key: string) {
    this.non_profit_obj.delete(email_key);
  }

  public update(email_key: string, updated_np_data: NonProfitDataUpdate) {
    const existing_obj: any = this.get(email_key);
    if (existing_obj === undefined) {
      return {
        operation: OpCode.UPDATE,
        msg: OpStatus.NOT_FOUND,
        non_profit: updated_np_data,
      };
    }

    const updated_object = {
      name: updated_np_data.name?.trim() || existing_obj.name,
      email: updated_np_data.updated_email?.trim() || existing_obj.email,
      address: updated_np_data.address?.trim() || existing_obj.address,
    };

    // If email is changing, remove the old entry
    if (updated_object.email !== existing_obj.email) {
      this.remove(email_key);
    }

    this.pure_set(updated_object);
    return {
      operation: OpCode.UPDATE,
      msg: OpStatus.SUCCESS,
      non_profit: this.get(updated_object.email),
    };
  }

  public get_all() {
    return this.non_profit_obj;
  }
}

export default NonProfitObj;
