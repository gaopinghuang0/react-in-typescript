import { Component } from "../core/Component";
import { InternalComponent } from "./InternalComponent";

/**
 * `InstanceMap` maintains a mapping from a public facing stateful
 * instance (key) and the internal representation (value). This allows public
 * methods to accept the user facing instance as an argument and map them back
 * to internal methods.
 */

export const InstanceMap = new WeakMap<Component<any, any>, InternalComponent>();
