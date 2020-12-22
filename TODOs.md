## Current step
* [x] Implement `updateComponent` in CompositeComponent
* [ ] Implement `updateComponent` in DOMComponent
* [ ] Replace `update` with `UpdateQueue` so that the `receiveComponent` will be called in a batch, rather than at the root of `render`.
* [ ] Implement batch update
  * [ ] Understand transaction.wrappers
  * [ ] Support transaction
  * [ ] UnmountComponent in a batch
* [ ] Add StatelessComponent to satisfy the assert(instance != null) in CompositeComponent.updateComponent().
* [ ] Implement real virtual diff algorithm
* [ ] Support Events
* [ ] Support Context


## Next step
* [ ] Change to Fiber
* [ ] Support hooks