# promise
- 1. promise三个状态：成功态（resolve） 失败态（reject） 等待态（pending，既不成功也不失败）
- 2. 用户自己决定 成功的value和失败的reason，成功和失败也是由用户定义的
- 3. promise 默认执行器 立即执行
- 4. promise实例都有一个then方法，参数是一个成功的回调，一个失败的回调
- 5. promise 执行器发生异常，则也会执行失败逻辑
- 6. promise一旦成功，就不会失败，反之，一旦失败，就不能成功

## 一 链式调用

### 1. Promise.then中的成功和失败的回调返回值（return xxxx），可以传递到外层的下一个then中
### 2. 传递到下一个then中的case：
    #### 2.1 上一个then的成功还是失败回调的return值为普通值（即除了promise和错误），都会传递到下一次成功中
    #### 2.2 上一个then的成功和失败回调中有出错的情况，则一定传递到下一次失败中
    #### 2.3 如果是promise的情况，那么会采用promise状态，来决定走下一次成功还是失败
### 3. 如果上一个then中没有错误处理，那么会向下找下一个then中的错误处理
### 4. then每次执行完都会返回一个 `新的promise`（而非返回this即同一个promise），才能继续调用then方法
    #### 4.1 如果返回this（同一个promise），有可能会由本次的then方法的失败态（在错误处理方法中 return 100）传到下一个then的成功态中，违背了promise的状态一旦成功或是失败就不能改变的原则了！！！

```javascript
read('/name.txt').then((data) => {
    //成功态
    return 100  // 返回值为普通值，传递到下一个then的成功态中
}, (err) => {
    // return 100  //出错返回值也为普通值，那么还是传递到下一次then的成功中
    throw err   // 肯定传递到下一个then中的失败态中
}).then((data) => {
    console.log(data)
}, (err) => {
    console.log(err)
})
```


## 二 链式调用解析

```javascript

// p1.resolve(100) -> p1.then
// 推到p2, p1.then拿到了100是因为调用了p1.resolve, 那么 p2.then拿到1，就应该p2去调用p2.resolve(1)
// 什么才能让p2的then拿到上一次的返回值呢？ -> p2.then
// p2.resolve(1)

let p1 = new Promise((resolve, reject) => {
    resolve(100)
})

// p2第二个promise
let p2 = p1.then((data) => {
    return 1
}, err => {
    return '失败'  //因为失败是普通值，也会传递到p2的成功回调中
})

p2.then((data) => {
    console.log('拿到 上一个then的返回值 1', data)
})
```

## 三 解析为啥x.then取值时有可能会报异常

```javascript

Object.defineProperty(x, 'then', {
    get () {
        //万一这么写呢
        throw Error(err)
    }
})
```


## 四 手写promise

```javascript
const PENDING = 'PENDING';
const RESOLVED = 'RESOLVED';
const REJECTED = 'REJECTED';

// 由于实现promise的库有很多，而且能够互相调用，所以要兼容， 如bluebird、q、 es6-promise
resolvePromise (promise2, x, resolve, reject) {
    // 循环引用：自己等待自己完成，错误引用
    if (promise2 === x) {
        return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
    }

    let called; //别人的promise可能又走成功又走失败了，所以以防别人的promise不健全，如果是自己写的，不用再做called判断了
    // 如果x是对象或者函数，能保证和其它库一起使用
    if ((typeof x === 'object' && x != null) || typeof x === 'function') {
        //进一步做判断
        try { //x取值时可能给你抛个异常
            let then = x.then;
            if (typeof then === 'function') {
                // 确保then调用的时候this指向x
                then.call(x, y => {
                    // y有可能还是promise，那么就要递归解析
                    // resolve(y)
                    if (!!called) return;
                    called = true;
                    resolvePromise(promise2, y, resolve, reject)
                }, e => {
                    if (!!called) return;
                    called = true;
                    reject(e)
                })
            } else {
                // x = {then: 1231}也是普通值
                resolve(x)
            }
        } catch (err) {
            if (!!called) return;
            called = true;
            reject(err)
        }
    } else {// 否则就是普通值，直接是成功态
        resolve(x)
    }
}

class Promise {

    constructor (executor) {

        this.status = PENDING;
        this.value = undefined;
        this.reason = undefined;
        this.onResolvedCallbacks = [];
        this.onRejectedCallbacks = [];
        
        // 成功
        let resolve = (value) => {

            // 在实现静态方法resolve时，添加的判断
            if (value instanceof Promise) {
                return value.then(resolve, reject) // 递归解析resolve的参数，直到这个值是普通值
            }

            //只有当状态是pending态时才能改变状态
            if (this.status === PENDING) {
                this.value = value  //用户决定的成功的值
                this.status = RESOLVED
                this.onResolvedCallbacks.forEach(fn => fn())
            }
        }
        // 失败
        let reject = (reason) => {
            //只有当状态是pending态时才能改变状态
            if (this.status === PENDING) {
                this.reason =  reason  // 用户决定的失败的原因
                this.status = REJECTED
                this.onRejectedCallbacks.forEach(fn => fn())
            }
        }

        try {
            // 立即执行
            executor(resolve, reject)
        } catch(e) {
            reject(e)
        }
    }

    then (onFulfilled, onRejected) {

        let promise2 = new Promise((resolve, reject) => {
            if (this.status === RESOLVED) {
                //如果执行器中加了个定时器2s才执行resolve呢,那么此时状态是pending态
                // 必须使用异步，才能拿到promise2
                // 由于x不确定是普通值还是错误还是promise，所以封装个函数来处理
                // try catch 不能捕获异步错误
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch(err) {
                        reject(err)
                    }
                }, 0)
            }

            if (this.status === REJECTED) {
                //如果执行器中加了个定时器2s才执行reject呢,那么此时状态是pending态
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch(err) {
                        reject(err)
                    }
                }, 0)
            }

            // 1. 调用then方法时，还没有成功或者失败，处于pending态
            // 2. 使用发布订阅模式，如果当前是pending态，我们需要将成功的回调或者失败的回调存放起来，稍后调用resolve和reject时重新执行
            if (this.status === PENDING) {

                this.onResolvedCallbacks.push(() => {
                    // 此时这里使用了AOP切片编程思想
                    // todo...
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.value)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch(err) {
                            reject(err)
                        }
                    }, 0)
                })
                this.onRejectedCallbacks.push(() => {
                    // 此时这里使用了AOP切片编程思想
                    // todo...
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.reason)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch(err) {
                            reject(err)
                        }
                    }, 0)
                })
            }
        })

        return promise2;  // 返回一个新的promise实例
    }
}

```

【注】try catch无法捕获异步错误，只能捕获同步错误

## 五 实现catch方法

```javascript

class Promise {

    //没有成功的then，只有错误处理
    catch (errCallback) {
        return this.then(null, errCallback)
    }
}
```

## 六 实现静态方法 resolve 和 reject
> resolve和reject区别：resolve要等待参数里面的promise执行完毕，而reject不会有等待效果

```javascript

class Promise {

    static resolve (value) {
        return new Promise((resolve, reject) => {
            resolve(value)
        })
    }

    static reject (err) {
        return new Promise((resolve, reject) => {
            reject(err)
        })
    }
}
```

## 七 实现finally方法, 是无论如何都要执行的意思

```javascript

class Promise {

    finally(callback) {
        return this.then((value) => {
            return Promise.resolve(callback()).then(() => value)
        }, reason => {
            return Promise.resolve(callback()).then(() => {
                throw Error(reason)
            })
        })
    }
}
```

## 八 实现静态方法all,全部成功才成功

```javascript

class Promise {

    static all (promiseArr) {

        promiseArr.forEach( (item, index) => {
            if (!!item.then) {
                item.then(() => {

                }, err => {

                })
            }
        })
        return new Promise((resolve, reject) => {

        })
    }
}
```