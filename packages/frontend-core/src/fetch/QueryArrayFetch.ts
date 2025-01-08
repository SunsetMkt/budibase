import FieldFetch, { FieldDatasource } from "./FieldFetch"
import {
  getJSONArrayDatasourceSchema,
  generateQueryArraySchemas,
} from "../utils/json"

export default class QueryArrayFetch extends FieldFetch {
  async getDefinition(datasource: FieldDatasource) {
    if (!datasource?.tableId) {
      return null
    }
    // JSON arrays need their table definitions fetched.
    // We can then extract their schema as a subset of the table schema.
    try {
      const table = await this.API.fetchQueryDefinition(datasource.tableId)
      const schema = generateQueryArraySchemas(
        table.schema,
        table.nestedSchemaFields
      )
      const result = {
        schema: getJSONArrayDatasourceSchema(schema, datasource),
      }

      return result
    } catch (error) {
      return null
    }
  }
}
