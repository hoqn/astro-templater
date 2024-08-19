import { z } from "zod";

export interface ParsedZodTypePrimitive<D> {
  typeName: z.ZodFirstPartyTypeKind;
  optional?: boolean;
  nullable?: boolean;
  defaultValue?: D;
}

export interface ParsedZodTypeWithSubType<D> extends ParsedZodTypePrimitive<D> {
  typeName: z.ZodFirstPartyTypeKind.ZodArray;
  subType: ParsedZodType<D>;
}

export interface ParsedZodTypeWithSubTypes<D> extends ParsedZodTypePrimitive<D> {
  typeName:
    | z.ZodFirstPartyTypeKind.ZodUnion
    | z.ZodFirstPartyTypeKind.ZodIntersection
    | z.ZodFirstPartyTypeKind.ZodObject
    | z.ZodFirstPartyTypeKind.ZodEnum;
  subType: ParsedZodType<D>[];
}

export type ParsedZodType<D> = ParsedZodTypePrimitive<D> | ParsedZodTypeWithSubType<D> | ParsedZodTypeWithSubTypes<D>;

export function parseZodType(zod: z.ZodTypeAny): ParsedZodType<any> {
  let mainType = zod;
  let optional = false;
  let nullable = false;
  let defaultValue = undefined;
  let subType = null;

  // check nullable, optional, and default
  while ("innerType" in mainType._def) {
    switch (mainType._def.typeName) {
      case z.ZodFirstPartyTypeKind.ZodOptional:
        optional = true;
        break;
      case z.ZodFirstPartyTypeKind.ZodNullable:
        nullable = true;
        break;
      case z.ZodFirstPartyTypeKind.ZodDefault:
        defaultValue = mainType._def.defaultValue();
        break;
    }

    mainType = mainType._def.innerType;
  }

  // array
  if (mainType._def.typeName === z.ZodFirstPartyTypeKind.ZodArray) {
    subType = mainType._def.type;

    return {
      typeName: z.ZodFirstPartyTypeKind.ZodArray,
      optional,
      nullable,
      defaultValue,
      subType,
    };
  }

  return {
    typeName: mainType._def.typeName as z.ZodFirstPartyTypeKind,
    optional,
    nullable,
    defaultValue,
  };
}
