interface NonProfitData {
  name: string;
  email: string;
  address: string;
}

enum OpCode {
  GET = "get",
  CREATE = "create",
  UPDATE = "update",
  GETALL = "get all",
}

export enum OpStatus {
  SUCCESS = "success",
  ERROR_DUP = "error: duplicate exists",
  NOT_FOUND = "error: nonprofit not found",
}

class NonProfitObj {
  private non_profit_obj: Map<string, NonProfitData>;

  constructor() {
    this.non_profit_obj = new Map();
  }

  private pure_set(np_data: NonProfitData) {
    this.non_profit_obj.set(np_data.email, np_data);
  }

  public get(email_key: string, internalCall: boolean = false) {
    if (internalCall) {
      const found_obj = this.non_profit_obj.get(email_key);
      return found_obj !== undefined ? found_obj : undefined;
    }

    return {
      operation: OpCode.GET,
      msg: OpStatus.SUCCESS,
      non_profit: this.non_profit_obj.get(email_key),
    };
  }

  public add(added_np_data: NonProfitData) {
    const email_key = added_np_data.email;
    const get_result = this.get(email_key, true);

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
      non_profit: this.get(added_np_data.email, true),
    };
  }

  public update(updated_np_data: NonProfitData) {
    const existing_obj = this.get(updated_np_data.email, true);

    if (existing_obj === undefined) {
      return {
        operation: OpCode.UPDATE,
        msg: OpStatus.NOT_FOUND,
        non_profit: updated_np_data,
      };
    }

    this.pure_set(updated_np_data);
    return {
      operation: OpCode.UPDATE,
      msg: OpStatus.SUCCESS,
      non_profit: this.get(updated_np_data.email, true),
    };
  }

  public get_all(internalCall: boolean = false) {
    if (internalCall) {
      return this.non_profit_obj;
    }

    return {
      operation: OpCode.GETALL,
      msg: OpStatus.SUCCESS,
      non_profit_all: this.non_profit_obj,
    };
  }
}

export default NonProfitObj;
