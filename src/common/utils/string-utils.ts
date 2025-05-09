/**
 * StringUtils class - String manipulation utilities
 */
export class StringUtils {
  /**
   * Convert string to PascalCase (e.g., 'user-service' -> 'UserService')
   */
  static toPascalCase(str: string): string {
    return str
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Convert string to camelCase (e.g., 'user-service' -> 'userService')
   */
  static toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  /**
   * Convert string to kebab-case (e.g., 'UserService' -> 'user-service')
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Convert string to snake_case (e.g., 'UserService' -> 'user_service')
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  /**
   * Get singular form of a word (simple implementation)
   */
  static getSingular(str: string): string {
    if (str.endsWith('ies')) {
      return str.slice(0, -3) + 'y';
    } else if (str.endsWith('s') && !str.endsWith('ss')) {
      return str.slice(0, -1);
    }
    return str;
  }

  /**
   * Get plural form of a word (simple implementation)
   */
  static getPlural(str: string): string {
    if (str.endsWith('y')) {
      return str.slice(0, -1) + 'ies';
    } else if (!str.endsWith('s')) {
      return str + 's';
    }
    return str;
  }
}
