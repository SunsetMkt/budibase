import "./images"
import { Datasource, SourceName } from "@budibase/types"
import * as postgres from "./postgres"
import * as mongodb from "./mongodb"
import * as mysql from "./mysql"
import * as mssql from "./mssql"
import * as mariadb from "./mariadb"
import * as oracle from "./oracle"
import { testContainerUtils } from "@budibase/backend-core/tests"
import { Knex } from "knex"
import TestConfiguration from "../../../tests/utilities/TestConfiguration"

export type DatasourceProvider = () => Promise<Datasource | undefined>

export const { startContainer } = testContainerUtils

export enum DatabaseName {
  POSTGRES = "postgres",
  MONGODB = "mongodb",
  MYSQL = "mysql",
  SQL_SERVER = "mssql",
  MARIADB = "mariadb",
  ORACLE = "oracle",
  SQS = "sqs",
}

const providers: Record<DatabaseName, DatasourceProvider> = {
  [DatabaseName.POSTGRES]: postgres.getDatasource,
  [DatabaseName.MONGODB]: mongodb.getDatasource,
  [DatabaseName.MYSQL]: mysql.getDatasource,
  [DatabaseName.SQL_SERVER]: mssql.getDatasource,
  [DatabaseName.MARIADB]: mariadb.getDatasource,
  [DatabaseName.ORACLE]: oracle.getDatasource,
  [DatabaseName.SQS]: async () => undefined,
}

export interface DatasourceDescribeOpts {
  name: string
  only?: DatabaseName[]
  exclude?: DatabaseName[]
}

export interface DatasourceDescribeReturnPromise {
  rawDatasource: Datasource | undefined
  datasource: Datasource | undefined
  client: Knex | undefined
}

export interface DatasourceDescribeReturn {
  name: DatabaseName
  config: TestConfiguration
  dsProvider: () => Promise<DatasourceDescribeReturnPromise>
  isInternal: boolean
  isExternal: boolean
  isSql: boolean
  isMySQL: boolean
  isPostgres: boolean
  isMongodb: boolean
  isMSSQL: boolean
  isOracle: boolean
}

async function createDatasources(
  config: TestConfiguration,
  name: DatabaseName
): Promise<DatasourceDescribeReturnPromise> {
  await config.init()

  const rawDatasource = await getDatasource(name)

  let datasource: Datasource | undefined
  if (rawDatasource) {
    datasource = await config.api.datasource.create(rawDatasource)
  }

  let client: Knex | undefined
  if (rawDatasource) {
    try {
      client = await knexClient(rawDatasource)
    } catch (e) {
      // ignore
    }
  }

  return {
    rawDatasource,
    datasource,
    client,
  }
}

// Jest doesn't allow test files to exist with no tests in them. When we run
// these tests in CI, we break them out by data source, and there are a bunch of
// test files that only run for a subset of data sources, and for the rest of
// them they will be empty test files. Defining a dummy test makes it so that
// Jest doesn't error in this situation.
function createDummyTest() {
  describe("no tests", () => {
    it("no tests", () => {
      // no tests
    })
  })
}

export function datasourceDescribe(
  opts: DatasourceDescribeOpts,
  cb: (args: DatasourceDescribeReturn) => void
) {
  if (process.env.DATASOURCE === "none") {
    createDummyTest()
    return
  }

  const { name, only, exclude } = opts

  if (only && exclude) {
    throw new Error("you can only supply one of 'only' or 'exclude'")
  }

  let databases = Object.values(DatabaseName)
  if (only) {
    databases = only
  } else if (exclude) {
    databases = databases.filter(db => !exclude.includes(db))
  }

  if (process.env.DATASOURCE) {
    databases = databases.filter(db => db === process.env.DATASOURCE)
  }

  if (databases.length === 0) {
    createDummyTest()
    return
  }

  describe.each(databases)(name, name => {
    const config = new TestConfiguration()

    afterAll(() => {
      config.end()
    })

    cb({
      name,
      config,
      dsProvider: () => createDatasources(config, name),
      isInternal: name === DatabaseName.SQS,
      isExternal: name !== DatabaseName.SQS,
      isSql: [
        DatabaseName.MARIADB,
        DatabaseName.MYSQL,
        DatabaseName.POSTGRES,
        DatabaseName.SQL_SERVER,
        DatabaseName.ORACLE,
      ].includes(name),
      isMySQL: name === DatabaseName.MYSQL,
      isPostgres: name === DatabaseName.POSTGRES,
      isMongodb: name === DatabaseName.MONGODB,
      isMSSQL: name === DatabaseName.SQL_SERVER,
      isOracle: name === DatabaseName.ORACLE,
    })
  })
}

function getDatasource(
  sourceName: DatabaseName
): Promise<Datasource | undefined> {
  return providers[sourceName]()
}

export async function knexClient(ds: Datasource) {
  switch (ds.source) {
    case SourceName.POSTGRES: {
      return postgres.knexClient(ds)
    }
    case SourceName.MYSQL: {
      return mysql.knexClient(ds)
    }
    case SourceName.SQL_SERVER: {
      return mssql.knexClient(ds)
    }
    case SourceName.ORACLE: {
      return oracle.knexClient(ds)
    }
    default: {
      throw new Error(`Unsupported source: ${ds.source}`)
    }
  }
}
