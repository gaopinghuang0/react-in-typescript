## Current step
* [ ] Implement `updateComponent` in CompositeComponent
* [ ] Implement `updateComponent` in DOMComponent
* [ ] Replace `update` with `UpdateQueue` so that the `receiveComponent` will be called in a batch, rather than at the root of `render`.
* [ ] Implement batch update
  * [ ] Understand transaction.wrappers
  * [ ] Support transaction
* [ ] Add PooledClass
* [ ] Implement real virtual diff algorithm
* [ ] Support Events


## Next step
* [ ] Change to Fiber
* [ ] Support hooks