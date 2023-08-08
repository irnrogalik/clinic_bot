import * as AWS from 'aws-sdk';
import { QueryParams, QueryGetParams, QueryUpdateParams, QueryPutParams } from './interfaces';

export class Dynamo {
  private db;
  
  constructor() {
    this.db = new AWS.DynamoDB.DocumentClient();
  }

  async getAll(params: QueryParams) {
    return await this.db.scan(params).promise();
  }

  async getById(params: QueryGetParams) {
    return await this.db.get(params).promise();
  }

  async update(params: QueryUpdateParams) {
    return await this.db.update(params).promise();
  }

  async put(params: QueryPutParams) {
    return await this.db.put(params).promise();
  }
}
