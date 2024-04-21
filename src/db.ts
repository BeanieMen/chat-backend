import * as fs from "fs";

export class HighDB<T extends object> {
  data: T;
  location: string;
  constructor(location: string, defaultData: T) {
    this.data = defaultData;
    this.location = location;
    if (!fs.existsSync(this.location)) {
        fs.writeFileSync(this.location, JSON.stringify(defaultData, null, 2));
      }
  }

  async setConfig(data: Partial<T>): Promise<void> {
    Object.assign(this.data, data);
    await fs.promises.writeFile(
      this.location,
      JSON.stringify(this.data, null, 2)
    );
  }
}
