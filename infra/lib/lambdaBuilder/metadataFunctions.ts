/*
 * Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib";

export function buildMetadataFunctions(
    scope: Construct,
    ddbtable: dynamodb.Table
): lambda.Function[] {
    return ["create", "read", "update", "delete"].map((f) =>
        buildMetadataFunction(scope, ddbtable, f)
    );
}

export function buildMetadataFunction(
    scope: Construct,
    ddbtable: dynamodb.Table,
    name: string
): lambda.Function {
    const fun = new lambda.DockerImageFunction(scope, name + "-metadata", {
        code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, `../../../backend/`), {
            cmd: [`backend.handlers.metadata.${name}.lambda_handler`],
        }),
        timeout: Duration.minutes(15),
        memorySize: 3008,
        environment: {
            METADATA_STORAGE_TABLE_NAME: ddbtable.tableName,
        },
    });
    ddbtable.grantReadWriteData(fun);
    return fun;
}
