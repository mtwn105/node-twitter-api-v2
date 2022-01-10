
interface ICachedItem<T> {
  item: T;
  expire: number;
  timeout?: NodeJS.Timeout;
}

export class TTLCache<K, T> {
  protected items = new Map<K, ICachedItem<T>>();

  has(key: K) {
    return this.items.has(key);
  }

  get(key: K) {
    if (this.items.has(key)) {
      return this.items.get(key)!.item;
    }
    return undefined;
  }

  ttl(key: K) {
    if (this.items.has(key)) {
      const expire = this.items.get(key)!.expire;
      if (expire >= 0) {
        return expire - Date.now();
      }
      return -2;
    }
    return -1;
  }

  set(key: K, item: T, ttl: number) {
    this.delete(key);

    const fullItem: ICachedItem<T> = {
      item,
      expire: ttl >= 0 ? Date.now() + ttl : -1,
    };

    if (ttl >= 0) {
      fullItem.timeout = setTimeout(this.delete.bind(this, key), ttl),
      fullItem.timeout.unref();
    }

    this.items.set(key, fullItem);

    return this;
  }

  delete(key: K) {
    if (this.items.has(key)) {
      const cachedItem = this.items.get(key)!;
      if (cachedItem.timeout) {
        clearTimeout(cachedItem.timeout);
      }

      return this.items.delete(key);
    }

    return false;
  }
}
