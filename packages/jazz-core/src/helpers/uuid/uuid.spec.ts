import { createUUID } from "@helpers/uuid";

describe("uuid-test", () => {
  it("Should create many unique uuids", () => {
    const onlyUnique = (value: string, index: number, self: string[]) => {
      return self.indexOf(value) === index;
    };

    const num = 10;
    const ids: string[] = [];
    let uuid: string;
    for (let i = 0; i < num; i++) {
      uuid = createUUID();
      ids.push(uuid);
    }

    var unique = ids.filter(onlyUnique);

    expect(ids.length).toEqual(unique.length);
  });
});
