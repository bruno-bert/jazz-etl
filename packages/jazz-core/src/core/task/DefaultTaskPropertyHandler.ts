import {
  IsTaskPropertyHandler,
  TaskProperty,
  PropertyValue,
  Payload,
  PropertyType
} from "../../types/core";

export class DefaultTaskPropertyHandler implements IsTaskPropertyHandler {
  constructor() {}

  validateProperty(property: TaskProperty): boolean {
    /** TODO - create routine to validate task property */
    return true;
  }
  resolve(data: Payload, property: TaskProperty): TaskProperty {
    /** TODO - create routine to resolve other types */
    switch (property.type) {
      case PropertyType.EXPRESSION: {
        if (typeof property.expression == "function") {
          return { ...property, value: property.expression(data) };
        }
        return property;
      }

      case PropertyType.FIXED_VALUE: {
        /** for fixed vaue, it will copy the expression content to the resolved value */
        return { ...property, value: property.expression };
      }
      default: {
        return property;
      }

      /*
      case PropertyType.CONTEXT_VARIABLE_GLOBAL: {
        return property;
      }
      case PropertyType.CONTEXT_VARIABLE_LOCAL: {
        return property;
      }
      case PropertyType.ENVIRONMENT_VARIABLE: {
        return property;
      }*/
    }
  }

  resolveAll(data: Payload, properties: TaskProperty[]): TaskProperty[] {
    let resolvedProperties: TaskProperty[] = [];

    properties.forEach(property => {
      resolvedProperties.push(this.resolve(data, property));
    });
    return resolvedProperties;
  }

  validate(properties: TaskProperty[]): boolean {
    for (let i = 0; i < properties.length; i++)
      if (!this.validateProperty(properties[i])) return false;

    return true;
  }
}
