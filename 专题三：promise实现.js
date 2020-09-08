const PENDING = 'PENDING';
const RESOLVED = 'RESOLVED';
const REJECTED = 'REJECTED';

// 由于实现promise的库有很多，而且能够互相调用，所以要兼容， 如bluebird、q、 es6-promise
const resolvePromise = (promise2, x, resolve, reject) => {
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
    } else { // 否则就是普通值，直接是成功态
        resolve(x)
    }
}

class Promise {

    constructor(executor) {

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
                this.value = value //用户决定的成功的值
                this.status = RESOLVED
                this.onResolvedCallbacks.forEach(fn => fn())
            }
        }
        // 失败
        let reject = (reason) => {
            //只有当状态是pending态时才能改变状态
            if (this.status === PENDING) {
                this.reason = reason // 用户决定的失败的原因
                this.status = REJECTED
                this.onRejectedCallbacks.forEach(fn => fn())
            }
        }

        try {
            // 立即执行
            executor(resolve, reject)
        } catch (e) {
            reject(e)
        }
    }

    then(onFulfilled, onRejected) {

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
                    } catch (err) {
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
                    } catch (err) {
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
                        } catch (err) {
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
                        } catch (err) {
                            reject(err)
                        }
                    }, 0)
                })
            }
        })

        return promise2; // 返回一个新的promise实例
    }

    catch (errCallback) {
        return this.then(null, errCallback)
    }

    static resolve(value) {
        return new Promise((resolve, reject) => {
            resolve(value)
        })
    }

    static reject(reason) {
        return new Promise((resolve, reject) => {
            reject(reason)
        })
    }

    finally(callback) {
        return this.then((value) => {
            // resolve的值
            // 将callback回调变成等待的promise
            return Promise.resolve(callback()).then(() => value)
        }, reason => {
            // reject的reason
            return Promise.resolve(callback()).then(() => {
                throw Error(reason)
            })
        })
    }
}



// eg
Promise.resolve(123).finally(() => {
    return new Promise((resolve, reject) => {
        resolve('ok')
    })
}).then((data) => {
    console.log(data)
}, err => {
    console.log(err)
})