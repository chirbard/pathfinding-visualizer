class GridNode {
  private _data: string;
  private _last: [number, number] | undefined;

  public constructor(data: string) {
    this._data = data;
  }

  public getData(): string {
    return this._data;
  }

  public setData(data: string) {
    this._data = data;
  }

  public getLast(): [number, number] | undefined {
    return this._last;
  }

  public setLast(next: [number, number] | undefined) {
    return (this._last = next);
  }
}

export default GridNode;
