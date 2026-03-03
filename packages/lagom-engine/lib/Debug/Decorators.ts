export const ReadonlyField = Symbol("ReadonlyField");
export const VisibleField = Symbol("VisibleField");

/**
 * Mark a field as readonly. Will be visible in the debugger but not editable.
 * This implies that a field is visible, so the visible annotation is not required.
 */
export function readonly(target: any, propertyKey: string): void {
    ((target[ReadonlyField] as Set<any> | undefined) ??= new Set()).add(propertyKey);
}

/**
 * Mark a field as visible in the debugger. If used on an object, subfields need to also be annotated to be visible.
 */
export function visible(target: any, propertyKey: string): void {
    ((target[VisibleField] as Set<any> | undefined) ??= new Set()).add(propertyKey);
}
