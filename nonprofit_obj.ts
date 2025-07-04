interface NonProfitData {
  name: string;
  email: string;
  address: string;
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

  public get_all() {
    return this.non_profit_obj;
  }
}

export default NonProfitObj;
