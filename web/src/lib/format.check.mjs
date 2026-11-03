// 엑셀 내보내기 칸 처리 검사: node src/lib/format.check.mjs
import assert from "node:assert/strict";
import { csv } from "./format.ts";

const line = (cells) => csv([cells]).slice(1); // 맨 앞 BOM을 뺀 한 줄

assert.ok(csv([["a"]]).startsWith("﻿"), "엑셀이 한글을 UTF-8로 읽도록 BOM을 붙인다");
assert.equal(line(["김리폼", 28500, undefined, null]), '"김리폼",28500,"",""');
assert.equal(line(["010-1234-5678", "서울시 마포구"]), '"010-1234-5678","서울시 마포구"');
// 숫자로 읽히면 0이 빠지거나 1.2E+11로 바뀌는 값
assert.equal(line(["01012345678", "123456789012"]), '"=""01012345678""","=""123456789012"""');
// 수식으로 실행될 수 있는 값은 글자로만 보이게
assert.equal(line(["=1+1", "-2", "+82 10", "@SUM(A1)"]), '"=""=1+1""","=""-2""","=""+82 10""","=""@SUM(A1)"""');
assert.equal(line([' =HYPERLINK("x")']), '"=""=HYPERLINK(""""x"""")"""');
// 따옴표·줄바꿈
assert.equal(line(['소매 "왼쪽"\n짧게']), '"소매 ""왼쪽"" 짧게"');

console.log("엑셀 내보내기 칸 처리 검사 통과");
