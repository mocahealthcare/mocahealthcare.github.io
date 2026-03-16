import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import {
  RotateCcw,
  Undo2,
  HelpCircle,
  CheckCircle2,
  PenTool,
  ArrowRight,
} from "lucide-react";

type NodeId = "1" | "A" | "2" | "B" | "3" | "C" | "4" | "D" | "5" | "E";

type NodeItem = {
  id: NodeId;
  x: number;
  y: number;
  kind: "number" | "letter";
  label?: string;
};

type Point = { x: number; y: number };
type Stroke = { points: Point[] };
type Language = "zh" | "en";

const EXPECTED_SEQUENCE: NodeId[] = ["1", "A", "2", "B", "3", "C", "4", "D", "5", "E"];

const NODES: NodeItem[] = [
  { id: "E", x: 110, y: 55, kind: "letter", label: "End" },
  { id: "A", x: 265, y: 60, kind: "letter" },
  { id: "5", x: 30, y: 120, kind: "number" },
  { id: "1", x: 110, y: 170, kind: "number", label: "Begin" },
  { id: "B", x: 210, y: 145, kind: "letter" },
  { id: "2", x: 300, y: 150, kind: "number" },
  { id: "D", x: 30, y: 245, kind: "letter" },
  { id: "4", x: 210, y: 245, kind: "number" },
  { id: "3", x: 325, y: 260, kind: "number" },
  { id: "C", x: 100, y: 320, kind: "letter" },
];

const VIEW_W = 390;
const VIEW_H = 400;
const NODE_R = 22;
const SCREENS = [
  { value: "trail", zh: "连线题", en: "Trail Making" },
  { value: "draw-cube", zh: "立方体", en: "Cube Copy" },
  { value: "draw-clock", zh: "画钟题", en: "Clock Drawing" },
  { value: "naming", zh: "命名题", en: "Naming" },
  { value: "memory", zh: "记忆题", en: "Memory" },
  { value: "attention-digits", zh: "注意题", en: "Digit Span" },
  { value: "attention-a", zh: "A 点击", en: "Tap on A" },
  { value: "serial-7", zh: "减 7", en: "Serial 7s" },
  { value: "language-repeat", zh: "句子复述", en: "Sentence Repetition" },
  { value: "language-fluency", zh: "词语流畅性", en: "Verbal Fluency" },
  { value: "abstraction", zh: "抽象题", en: "Abstraction" },
  { value: "delayed-recall", zh: "延迟回忆", en: "Delayed Recall" },
  { value: "orientation", zh: "定向题", en: "Orientation" },
] as const;

type Screen = (typeof SCREENS)[number]["value"];

const LanguageContext = createContext<Language>("zh");

function useI18n() {
  const language = useContext(LanguageContext);
  const t = (zh: string, en: string) => (language === "zh" ? zh : en);
  return { language, t };
}

export default function MocaUiPrototype() {
  const [screen, setScreen] = useState<Screen | "result">("trail");
  const [language, setLanguage] = useState<Language>("en");

  return (
    <LanguageContext.Provider value={language}>
      <div className="min-h-screen bg-neutral-100 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                  {language === "zh" ? "MOCA 测评" : "MOCA Assessment"}
                </h1>
                <p className="mt-1 text-sm md:text-base text-neutral-600">
                  {language === "zh"
                    ? "测评过程中可通过顶部导航查看当前题目；提交后进入结果页时，顶部导航自动隐藏。"
                    : "Use the top navigation to switch tasks during the assessment. The navigation hides automatically on the result screen."}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start rounded-2xl bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setLanguage("zh")}
                  className={`rounded-xl px-4 py-2 text-sm transition ${language === "zh" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
                >
                  中文
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`rounded-xl px-4 py-2 text-sm transition ${language === "en" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
                >
                  English
                </button>
              </div>
            </div>

            {screen !== "result" ? (
              <div className="flex w-full flex-col gap-3 xl:w-auto">
                <div className="xl:hidden">
                  <select
                    value={screen}
                    onChange={(e) => setScreen(e.target.value as Screen)}
                    className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-base outline-none transition focus:border-neutral-500"
                  >
                    {SCREENS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {language === "zh" ? item.zh : item.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="hidden xl:block overflow-x-auto rounded-2xl bg-white p-1 shadow-sm">
                  <div className="inline-flex h-auto min-w-max gap-1 rounded-2xl bg-transparent p-0">
                    {SCREENS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setScreen(item.value)}
                        className={`rounded-xl px-4 py-2 text-sm transition ${
                          screen === item.value
                            ? "bg-neutral-900 text-white"
                            : "bg-transparent text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        {language === "zh" ? item.zh : item.en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {screen === "trail" ? <TrailMakingScreen onNext={() => setScreen("draw-cube")} /> : null}
          {screen === "draw-cube" ? <DrawingQuestionScreen mode="cube" onNext={() => setScreen("draw-clock")} /> : null}
          {screen === "draw-clock" ? <DrawingQuestionScreen mode="clock" onNext={() => setScreen("naming")} /> : null}
          {screen === "naming" ? <NamingScreen onNext={() => setScreen("memory")} /> : null}
          {screen === "memory" ? <MemoryLearningScreen onNext={() => setScreen("attention-digits")} /> : null}
          {screen === "attention-digits" ? <AttentionDigitScreen onNext={() => setScreen("attention-a")} /> : null}
          {screen === "attention-a" ? <AttentionAScreen onNext={() => setScreen("serial-7")} /> : null}
          {screen === "serial-7" ? <SerialSevenScreen onNext={() => setScreen("language-repeat")} /> : null}
          {screen === "language-repeat" ? <LanguageRepeatScreen onNext={() => setScreen("language-fluency")} /> : null}
          {screen === "language-fluency" ? <LanguageFluencyScreen onNext={() => setScreen("abstraction")} /> : null}
          {screen === "abstraction" ? <AbstractionScreen onNext={() => setScreen("delayed-recall")} /> : null}
          {screen === "delayed-recall" ? <DelayedRecallScreen onNext={() => setScreen("orientation")} /> : null}
          {screen === "orientation" ? <OrientationScreen onComplete={() => setScreen("result")} /> : null}
          {screen === "result" ? <ResultScreen /> : null}
        </div>
      </div>
    </LanguageContext.Provider>
  );
}

function TrailMakingScreen({ onNext }: { onNext: () => void }) {
  const { t, language } = useI18n();
  const [selected, setSelected] = useState<NodeId[]>([]);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [lastWrong, setLastWrong] = useState<NodeId | null>(null);

  const expectedNext = EXPECTED_SEQUENCE[selected.length];
  const currentKindHint = expectedNext
    ? NODES.find((n) => n.id === expectedNext)?.kind
    : null;

  const completed = selected.length === EXPECTED_SEQUENCE.length;
  const hintLevel = consecutiveErrors >= 2 ? 2 : consecutiveErrors >= 1 ? 1 : 0;

  const message = useMemo(() => {
    if (completed) return t("已完成本题。", "This task is complete.");
    if (selected.length === 0) return t("请从 1 开始。", "Start from 1.");
    if (hintLevel === 0) return t("很好，请继续按数字和字母交替连接。", "Good. Keep alternating between numbers and letters.");
    if (hintLevel === 1) return t("请按数字和字母交替连接。", "Please alternate between numbers and letters.");
    return currentKindHint === "letter"
      ? t("提示：下一步应选择一个字母。", "Hint: the next choice should be a letter.")
      : t("提示：下一步应选择一个数字。", "Hint: the next choice should be a number.");
  }, [completed, currentKindHint, hintLevel, selected.length, t]);

  const pathLines = useMemo(() => {
    const pairs: Array<{ from: NodeItem; to: NodeItem }> = [];
    for (let i = 0; i < selected.length - 1; i++) {
      const from = NODES.find((n) => n.id === selected[i]);
      const to = NODES.find((n) => n.id === selected[i + 1]);
      if (from && to) pairs.push({ from, to });
    }
    return pairs;
  }, [selected]);

  const guideLines = useMemo(() => {
    const guideSequence: NodeId[] = ["1", "A", "2"];
    const pairs: Array<{ from: NodeItem; to: NodeItem }> = [];

    for (let i = 0; i < guideSequence.length - 1; i++) {
      const from = NODES.find((n) => n.id === guideSequence[i]);
      const to = NODES.find((n) => n.id === guideSequence[i + 1]);
      if (from && to) pairs.push({ from, to });
    }

    return pairs;
  }, []);

  function handleNodeClick(id: NodeId) {
    if (completed) return;

    if (id === expectedNext) {
      setSelected((prev) => [...prev, id]);
      setConsecutiveErrors(0);
      setLastWrong(null);
      return;
    }

    setTotalErrors((v) => v + 1);
    setConsecutiveErrors((v) => v + 1);
    setLastWrong(id);
    setTimeout(() => setLastWrong((curr) => (curr === id ? null : curr)), 700);
  }

  function resetAll() {
    setSelected([]);
    setConsecutiveErrors(0);
    setTotalErrors(0);
    setLastWrong(null);
  }

  function undoLast() {
    setSelected((prev) => prev.slice(0, -1));
    setConsecutiveErrors(0);
    setLastWrong(null);
  }

  function nodeIsDimlyHinted(node: NodeItem) {
    if (hintLevel < 2 || !currentKindHint || node.id === expectedNext) return false;
    return node.kind === currentKindHint;
  }

  function nodeIsPrimaryHint(node: NodeItem) {
    return selected.length === 0 ? node.id === "1" : false;
  }

  function getLineEndpoints(from: NodeItem, to: NodeItem) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    const inset = NODE_R - 2;

    return {
      x1: from.x + (dx / length) * inset,
      y1: from.y + (dy / length) * inset,
      x2: to.x - (dx / length) * inset,
      y2: to.y - (dy / length) * inset,
    };
  }

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">
              {t("连线题", "Trail Making")}
            </CardTitle>
            <p className="mt-2 text-base text-neutral-700 md:text-lg">{t("请按顺序交替连接数字和字母。", "Connect the numbers and letters in alternating order.")}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("从 1 开始，点击下一个正确的圆点。", "Start at 1 and click the next correct circle.")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
              {t("当前进度", "Progress")} {selected.length} / {EXPECTED_SEQUENCE.length}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
              {t("错误", "Errors")} {totalErrors}
            </Badge>
          </div>
        </div>

        <motion.div
          key={message}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            {completed ? <CheckCircle2 className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
            <p className="text-base md:text-lg font-medium text-neutral-800">{message}</p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div className="rounded-[28px] border bg-white p-3 md:p-5 shadow-sm">
            <div className="w-full overflow-hidden rounded-[24px] bg-neutral-50">
              <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-auto w-full">
                <defs>
                  <marker
                    id="trail-guide-arrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#737373" />
                  </marker>
                </defs>

                {selected.length === 0 &&
                  guideLines.map((line, idx) => {
                    const points = getLineEndpoints(line.from, line.to);
                    return (
                      <motion.line
                        key={`guide-${line.from.id}-${line.to.id}-${idx}`}
                        x1={points.x1}
                        y1={points.y1}
                        x2={points.x2}
                        y2={points.y2}
                        stroke="#737373"
                        strokeWidth="3"
                        strokeDasharray="8 8"
                        markerEnd="url(#trail-guide-arrow)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        transition={{ duration: 0.3 }}
                      />
                    );
                  })}

                {pathLines.map((line, idx) => (
                  (() => {
                    const points = getLineEndpoints(line.from, line.to);
                    return (
                      <motion.line
                        key={`${line.from.id}-${line.to.id}-${idx}`}
                        x1={points.x1}
                        y1={points.y1}
                        x2={points.x2}
                        y2={points.y2}
                        stroke="currentColor"
                        strokeWidth="3.5"
                        className="text-neutral-900"
                        initial={{ pathLength: 0, opacity: 0.3 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.25 }}
                      />
                    );
                  })()
                ))}

                {NODES.map((node) => {
                  const isSelected = selected.includes(node.id);
                  const isExpected = expectedNext === node.id;
                  const isWrong = lastWrong === node.id;
                  const strongHint = nodeIsPrimaryHint(node);
                  const dimHint = nodeIsDimlyHinted(node);

                  let fill = "white";
                  let stroke = "#171717";
                  let textColor = "#171717";
                  let strokeWidth = 2.5;

                  if (isSelected) {
                    fill = "#171717";
                    stroke = "#171717";
                    textColor = "white";
                  } else if (isWrong) {
                    fill = "#fef2f2";
                    stroke = "#dc2626";
                    textColor = "#dc2626";
                  } else if (strongHint) {
                    fill = "#f5f5f5";
                    stroke = "#171717";
                    strokeWidth = 4;
                  } else if (dimHint) {
                    fill = "#fafafa";
                    stroke = "#737373";
                    textColor = "#404040";
                    strokeWidth = 3;
                  } else if (isExpected && selected.length > 0) {
                    fill = "#fafafa";
                    stroke = "#171717";
                    strokeWidth = 3;
                  }

                  return (
                    <g key={node.id}>
                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r={NODE_R}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        className="cursor-pointer"
                        whileTap={{ scale: 0.96 }}
                        animate={isWrong ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
                        transition={{ duration: 0.35 }}
                        onClick={() => handleNodeClick(node.id)}
                      />
                      <text
                        x={node.x}
                        y={node.y + 6}
                        textAnchor="middle"
                        fontSize="21"
                        fontWeight="700"
                        fill={textColor}
                        style={{ userSelect: "none" }}
                        className="pointer-events-none"
                      >
                        {node.id}
                      </text>

                      {node.label && (
                        <text
                          x={node.x}
                          y={node.id === "1" ? node.y + 42 : node.y + 40}
                          textAnchor="middle"
                          fontSize="14"
                          fontWeight="500"
                          fill="#262626"
                          className="pointer-events-none"
                        >
                          {node.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t("帮助说明", "Instructions")}</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    {t("规则是数字与字母交替进行，例如：数字 → 字母 → 数字 → 字母。", "The rule is to alternate between numbers and letters, for example: number → letter → number → letter.")}
                  </p>
                </div>

                {showHelp && (
                  <div className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700 leading-6">
                    <p>{t("轻提示：点错后会提醒你要按数字和字母交替。", "Soft hint: after a wrong click, you will be reminded to alternate numbers and letters.")}</p>
                    <p className="mt-1">{t("加强提示：连续错两次后，会弱高亮下一步应选的类别。", "Stronger hint: after two consecutive mistakes, the next target type will be softly highlighted.")}</p>
                  </div>
                )}

                <div className="grid gap-3">
                  <Button onClick={undoLast} disabled={selected.length === 0} variant="outline" className="h-12 justify-start rounded-2xl text-base">
                    <Undo2 className="mr-2 h-4 w-4" />{t("撤销上一步", "Undo last step")}
                  </Button>

                  <Button onClick={resetAll} variant="outline" className="h-12 justify-start rounded-2xl text-base">
                    <RotateCcw className="mr-2 h-4 w-4" />{t("重新开始", "Restart")}
                  </Button>

                  <Button onClick={() => setShowHelp((v) => !v)} variant="outline" className="h-12 justify-start rounded-2xl text-base">
                    <HelpCircle className="mr-2 h-4 w-4" />{showHelp ? t("收起帮助", "Hide help") : t("查看帮助", "Show help")}
                  </Button>

                  <Button onClick={onNext} className="h-12 justify-start rounded-2xl text-base">
                    <ArrowRight className="mr-2 h-4 w-4" />{t("下一题", "Next task")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DrawingQuestionScreen({ mode, onNext }: { mode: "cube" | "clock"; onNext: () => void }) {
  const { t, language } = useI18n();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const currentStrokeRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);

  const title = mode === "cube" ? t("临摹立方体", "Cube Copy") : t("画钟题", "Clock Drawing");
  const subtitle =
    mode === "cube"
      ? t("请照着左边的图形，在右侧空白区域画出相同的立方体。", "Copy the cube shown on the left into the blank area on the right.")
      : t("请画一个时钟，并把时间画成 11 点 10 分。", "Draw a clock and set the time to 11:10.");
  const helpText =
    mode === "cube"
      ? t("请直接在右侧画布中作答。画错了可以撤销或重新开始。", "Draw directly on the canvas on the right. You can undo or restart if needed.")
      : t("请直接在右侧画布中完成作答。建议一次完成，不需要额外工具栏。", "Complete the task directly on the canvas on the right. It is designed to be done in one pass without extra tools.");

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    const rect = wrap.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }, [mode]);

  useEffect(() => {
    redraw();
  }, [strokes, mode, hasStarted, language]);

  function getCtx() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function redraw() {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = getCtx();
    if (!canvas || !wrap || !ctx) return;

    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#171717";
    ctx.lineWidth = 2.6;

    for (const stroke of strokes) {
      drawStroke(ctx, stroke.points);
    }

    if (isDrawingRef.current && currentStrokeRef.current.length > 0) {
      drawStroke(ctx, currentStrokeRef.current);
    }

    if (!hasStarted) {
      ctx.fillStyle = "#a3a3a3";
      ctx.font = "500 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(language === "zh" ? "请用笔在这里作答" : "Draw here", width / 2, height / 2);
      ctx.font = "400 13px sans-serif";
      ctx.fillText(language === "zh" ? "支持 Surface Pen / 鼠标 / 触控" : "Surface Pen / mouse / touch supported", width / 2, height / 2 + 26);
    }
  }

  function drawStroke(ctx: CanvasRenderingContext2D, points: Point[]) {
    if (points.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    if (points.length === 1) {
      const p = points[0];
      ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  function pointFromEvent(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = pointFromEvent(e);
    currentStrokeRef.current = [point];
    isDrawingRef.current = true;
    setIsDrawing(true);
    setHasStarted(true);
    redraw();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;
    const point = pointFromEvent(e);
    currentStrokeRef.current = [...currentStrokeRef.current, point];
    redraw();
  }

  function finishStroke(e?: React.PointerEvent<HTMLCanvasElement>) {
    if (e && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const finishedPoints = [...currentStrokeRef.current];
    if (finishedPoints.length > 0) {
      setStrokes((prev) => [...prev, { points: finishedPoints }]);
    }
    currentStrokeRef.current = [];
    isDrawingRef.current = false;
    setIsDrawing(false);
    redraw();
  }

  function undoStroke() {
    setStrokes((prev) => prev.slice(0, -1));
  }

  function clearCanvas() {
    setStrokes([]);
    setHasStarted(false);
    currentStrokeRef.current = [];
    isDrawingRef.current = false;
    setIsDrawing(false);
  }

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</CardTitle>
            <p className="mt-2 text-base text-neutral-700 md:text-lg">{subtitle}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("请尽量使用手写笔在画布中直接完成作答。", "Use a pen or stylus if possible to answer directly on the canvas.")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
              <PenTool className="mr-1 h-3.5 w-3.5" /> {t("Surface Pen 友好", "Surface Pen friendly")}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
              {t("笔画", "Strokes")} {strokes.length}
            </Badge>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5" />
            <p className="text-base md:text-lg font-medium text-neutral-800">{helpText}</p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-6 xl:grid-cols-[300px_1fr_260px]">
          <ReferencePanel mode={mode} />

          <div className="rounded-[28px] border bg-white p-3 md:p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-800">{t("请在这里作答", "Answer here")}</p>
                <p className="text-xs text-neutral-500 mt-1">{t("大画布、低干扰、适合手写笔输入", "Large canvas, low distraction, pen-friendly input")}</p>
              </div>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">{t("画布比例 4:3", "Canvas ratio 4:3")}</Badge>
            </div>

            <div
              ref={wrapRef}
              className="relative h-[520px] w-full overflow-hidden rounded-[24px] border-2 border-dashed border-neutral-200 bg-white"
            >
              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishStroke}
                onPointerLeave={() => isDrawingRef.current && finishStroke()}
                onPointerCancel={finishStroke}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t("画布设计要点", "Canvas notes")}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600 list-disc pl-5">
                    <li>{t("不提供颜色、橡皮擦、形状工具，避免改变测评性质。", "No colors, eraser, or shape tools are provided to keep the task faithful to the assessment.")}</li>
                    <li>{t("保留撤销与重画，降低误触惩罚。", "Undo and reset are kept to reduce penalties from accidental touches.")}</li>
                    <li>{t("画布留白大，按钮远离书写区域，适合 Surface Pen。", "The canvas leaves a large clear area, with controls away from the writing zone for Surface Pen use.")}</li>
                  </ul>
                </div>

                {showHelp && (
                  <div className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700 leading-6">
                    <p>{t("建议横屏使用，参考图始终固定在左侧。", "Landscape orientation is recommended, with the reference image fixed on the left.")}</p>
                    <p className="mt-1">{t("正式测评版可隐藏“笔画数”等辅助信息。", "A production assessment version can hide helper details such as the stroke count.")}</p>
                  </div>
                )}

                <div className="grid gap-3">
                  <Button onClick={undoStroke} disabled={strokes.length === 0} variant="outline" className="h-12 justify-start rounded-2xl text-base">
                    <Undo2 className="mr-2 h-4 w-4" />{t("撤销一笔", "Undo one stroke")}
                  </Button>

                  <Button onClick={clearCanvas} variant="outline" className="h-12 justify-start rounded-2xl text-base">
                    <RotateCcw className="mr-2 h-4 w-4" />{t("清空重画", "Clear and redraw")}
                  </Button>

                  <Button onClick={() => setShowHelp((v) => !v)} variant="outline" className="h-12 justify-start rounded-2xl text-base">
                    <HelpCircle className="mr-2 h-4 w-4" />{showHelp ? t("收起帮助", "Hide help") : t("查看帮助", "Show help")}
                  </Button>

                  <Button onClick={onNext} className="h-12 justify-start rounded-2xl text-base">
                    <ArrowRight className="mr-2 h-4 w-4" />{t("下一题", "Next task")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultScreen() {
  const { t } = useI18n();
  const rawScore = 24;
  const educationBonus = 1;
  const finalScore = rawScore + educationBonus;
  const status = finalScore >= 26 ? t("结果接近正常范围", "Result is close to the normal range") : t("建议人工复核", "Manual review is recommended");

  const sectionScores = [
    { name: t("视空间 / 执行功能", "Visuospatial / Executive"), score: "4 / 5", note: t("画立方体待审核", "Cube drawing pending review") },
    { name: t("命名", "Naming"), score: "3 / 3", note: t("自动判分完成", "Auto-scoring completed") },
    { name: t("注意", "Attention"), score: "5 / 6", note: t("A 点击存在 1 次漏点", "One missed target in Tap on A") },
    { name: t("语言", "Language"), score: "2 / 3", note: t("句子复述建议人工复核", "Sentence repetition should be reviewed manually") },
    { name: t("抽象", "Abstraction"), score: "2 / 2", note: t("自动初筛通过", "Passed initial auto-screening") },
    { name: t("延迟回忆", "Delayed Recall"), score: "3 / 5", note: t("仅统计无提示回忆", "Only free recall is counted") },
    { name: t("定向", "Orientation"), score: "6 / 6", note: t("自动判分完成", "Auto-scoring completed") },
  ];

  const pendingReview = [
    t("立方体临摹", "Cube copy"),
    t("画钟题", "Clock drawing"),
    t("句子复述", "Sentence repetition"),
    t("词语流畅性", "Verbal fluency"),
  ];

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{t("测评结果", "Assessment Result")}</CardTitle>
            <p className="mt-2 text-base text-neutral-700 md:text-lg">{t("这是一次自动初评结果，最终结论仍可结合人工审核修正。", "This is an automated preliminary result. The final conclusion can still be adjusted after manual review.")}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("建议将自动评分、教育加分和待审核项目分开展示。", "It is clearer to separate automated scoring, education bonus points, and items pending review.")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{t("原始分", "Raw Score")} {rawScore} / 30</Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{t("教育加分", "Education Bonus")} +{educationBonus}</Badge>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-base md:text-lg font-medium text-neutral-800">
              {t("当前自动结果：", "Current automated result: ")}{status}{t("。最终总分为", ". Final total score: ")} {finalScore} / 30.
            </p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4">
                  <p className="text-sm font-semibold text-neutral-800">{t("总分摘要", "Score Summary")}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t("将原始分、教育加分和最终分清楚拆开", "Separate the raw score, education bonus, and final score clearly")}</p>
                </div>

                <div className="bg-white p-5 md:p-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border bg-neutral-50 px-5 py-6 text-center">
                    <p className="text-sm text-neutral-500">{t("原始分", "Raw Score")}</p>
                    <p className="mt-2 text-5xl font-semibold text-neutral-900">{rawScore}</p>
                    <p className="mt-2 text-sm text-neutral-500">{t("满分 30", "Out of 30")}</p>
                  </div>
                  <div className="rounded-3xl border bg-neutral-50 px-5 py-6 text-center">
                    <p className="text-sm text-neutral-500">{t("教育加分", "Education Bonus")}</p>
                    <p className="mt-2 text-5xl font-semibold text-neutral-900">+{educationBonus}</p>
                    <p className="mt-2 text-sm text-neutral-500">{t("教育年限 ≤ 12 年", "Education years ≤ 12")}</p>
                  </div>
                  <div className="rounded-3xl border bg-neutral-900 px-5 py-6 text-center text-white">
                    <p className="text-sm text-neutral-300">{t("最终分", "Final Score")}</p>
                    <p className="mt-2 text-5xl font-semibold">{finalScore}</p>
                    <p className="mt-2 text-sm text-neutral-300">{t("自动初评结果", "Automated preliminary result")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4">
                  <p className="text-sm font-semibold text-neutral-800">{t("分模块得分", "Section Scores")}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t("更适合医生快速定位问题与审核重点", "Helps clinicians quickly locate issues and review priorities")}</p>
                </div>

                <div className="bg-white p-3 md:p-4">
                  <div className="grid gap-3">
                    {sectionScores.map((item) => (
                      <div key={item.name} className="rounded-2xl border px-4 py-4 md:px-5 md:py-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-base font-semibold text-neutral-900">{item.name}</p>
                            <p className="mt-1 text-sm text-neutral-500">{item.note}</p>
                          </div>
                          <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm w-fit">
                            {item.score}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t("待人工审核", "Pending Manual Review")}</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    {t("以下项目不建议完全依赖自动评分，建议医生或研究人员复核。", "The following items should not rely entirely on auto-scoring and are best reviewed by a clinician or researcher.")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pendingReview.map((item) => (
                    <Badge key={item} variant="secondary" className="rounded-full px-4 py-2 text-sm">
                      {item}
                    </Badge>
                  ))}
                </div>

                <div className="rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
                  <p className="font-medium text-neutral-800">{t("建议输出状态", "Suggested Output State")}</p>
                  <p className="mt-2">{t("本页更适合作为“自动初评摘要页”，而不是最终诊断页。", "This page works better as an automated preliminary summary page rather than a final diagnostic page.")}</p>
                  <p className="mt-1">{t("正式产品可以在这里提供导出 PDF、提交审核、查看原始作答等入口。", "A production version could provide actions here such as exporting PDF, submitting for review, or viewing original responses.")}</p>
                </div>

                <div className="grid gap-3">
                  <Button className="h-12 justify-start rounded-2xl text-base">
                    <CheckCircle2 className="mr-2 h-4 w-4" />{t("提交人工审核", "Submit for manual review")}
                  </Button>
                  <Button variant="outline" className="h-12 justify-start rounded-2xl text-base">
                    <ArrowRight className="mr-2 h-4 w-4" />{t("导出结果报告", "Export result report")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrientationScreen({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n();
  const [answers, setAnswers] = useState({
    date: "",
    month: "",
    year: "",
    day: "",
    place: "",
    city: "",
  });
  const [showHelp, setShowHelp] = useState(false);

  const filledCount = Object.values(answers).filter((v) => v.trim().length > 0).length;

  const items = [
    { key: "date", label: t("日期", "Date"), placeholder: t("请输入今天几号", "Enter today's date") },
    { key: "month", label: t("月份", "Month"), placeholder: t("请输入当前月份", "Enter the current month") },
    { key: "year", label: t("年份", "Year"), placeholder: t("请输入当前年份", "Enter the current year") },
    { key: "day", label: t("星期", "Day"), placeholder: t("请输入今天星期几", "Enter the current day of the week") },
    { key: "place", label: t("地点", "Place"), placeholder: t("请输入当前地点", "Enter the current place") },
    { key: "city", label: t("城市", "City"), placeholder: t("请输入当前城市", "Enter the current city") },
  ] as const;

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{t("定向题", "Orientation")}</CardTitle>
            <p className="mt-2 text-base text-neutral-700 md:text-lg">{t("请填写你当前所处的时间与地点信息。", "Please enter the current time and place information.")}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("包括日期、月份、年份、星期、地点和城市。", "Include the date, month, year, day, place, and city.")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{t("已填写", "Completed")} {filledCount} / 6</Badge>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5" />
            <p className="text-base md:text-lg font-medium text-neutral-800">
              {t("请根据你现在所在的真实时间和地点填写，不需要查找其他信息。", "Use your real current time and place. No external lookup is needed.")}
            </p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4">
                  <p className="text-sm font-semibold text-neutral-800">{t("时间与地点", "Time and Place")}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t("每项单独填写，避免把时间和地点混在一起", "Fill in each field separately to avoid mixing time and place information")}</p>
                </div>

                <div className="bg-white p-5 md:p-6 grid gap-4 md:grid-cols-2">
                  {items.map((item) => (
                    <div key={item.key} className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">{item.label}</label>
                      <input
                        value={answers[item.key]}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [item.key]: e.target.value }))}
                        placeholder={item.placeholder}
                        className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-base outline-none transition focus:border-neutral-500"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4">
                  <p className="text-sm font-semibold text-neutral-800">{t("设计说明", "Design Notes")}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t("这一题更适合简洁、稳定、低干扰的输入布局", "This task works best with a simple, stable, low-distraction input layout")}</p>
                </div>

                <div className="bg-white p-5 md:p-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border bg-neutral-50 px-4 py-4">
                    <p className="text-sm font-medium text-neutral-800">{t("时间信息", "Time Fields")}</p>
                    <p className="mt-2 text-sm text-neutral-600">{t("日期、月份、年份、星期分开填写，更容易判断与评分。", "Separating date, month, year, and day makes judging and scoring easier.")}</p>
                  </div>
                  <div className="rounded-2xl border bg-neutral-50 px-4 py-4">
                    <p className="text-sm font-medium text-neutral-800">{t("地点信息", "Place Fields")}</p>
                    <p className="mt-2 text-sm text-neutral-600">{t("地点与城市拆开，避免一个回答同时包含多个层级。", "Place and city are separated to avoid combining multiple levels into one answer.")}</p>
                  </div>
                  <div className="rounded-2xl border bg-neutral-50 px-4 py-4">
                    <p className="text-sm font-medium text-neutral-800">{t("正式版建议", "Production Suggestion")}</p>
                    <p className="mt-2 text-sm text-neutral-600">{t("医院场景可预设 place/city 的参考答案，便于后台自动判分。", "In clinical settings, reference answers for place and city can be preset for automatic scoring.")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t("补充说明", "Additional Notes")}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600 list-disc pl-5">
                    <li>{t("这题本身不需要复杂交互，关键是输入清楚、字段分离。", "This task does not require complex interaction. Clear inputs and separated fields matter most.")}</li>
                    <li>{t("正式测评时不建议在前端展示任何正确答案或自动校正提示。", "A production assessment should not show correct answers or auto-correction hints on the front end.")}</li>
                    <li>{t("如果用于居家远程版本，需要重新定义 place 的判分规则。", "If used in a home or remote version, the scoring rule for place should be redefined.")}</li>
                  </ul>
                </div>

                {showHelp && (
                  <div className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700 leading-6">
                    <p>{t("在机构内施测时，“地点”通常更容易标准化；居家测评时则需要额外定义规则。", "In institutional testing, the place field is easier to standardize. Home assessments need additional rules.")}</p>
                    <p className="mt-1">{t("这一题非常适合做自动判分，但 place / city 需要结合具体场景配置。", "This task is well suited to auto-scoring, but place and city should be configured for the specific setting.")}</p>
                  </div>
                )}

                <div className="grid gap-3">
                  <Button
                    onClick={() => setAnswers({ date: "", month: "", year: "", day: "", place: "", city: "" })}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />{t("清空本题", "Clear this task")}
                  </Button>

                  <Button
                    onClick={() => setShowHelp((v) => !v)}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />{showHelp ? t("收起帮助", "Hide help") : t("查看帮助", "Show help")}
                  </Button>

                  <Button onClick={onComplete} disabled={filledCount === 0} className="h-12 justify-start rounded-2xl text-base">
                    <CheckCircle2 className="mr-2 h-4 w-4" />{t("完成测评", "Finish assessment")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DelayedRecallScreen({ onNext }: { onNext: () => void }) {
  const { t } = useI18n();
  const [answers, setAnswers] = useState(["", "", "", "", ""]);
  const [showCues, setShowCues] = useState(false);
  const [categoryCues, setCategoryCues] = useState([false, false, false, false, false]);
  const [choiceCues, setChoiceCues] = useState([false, false, false, false, false]);
  const [showHelp, setShowHelp] = useState(false);

  const filledCount = answers.filter((v) => v.trim().length > 0).length;

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{t("延迟回忆", "Delayed Recall")}</CardTitle>
            <p className="mt-2 text-base text-neutral-700 md:text-lg">{t("请尽量回忆之前学过的 5 个词，并直接写出来。", "Recall the 5 words you learned earlier and write them down directly.")}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("先做无提示回忆；下方提示记录区只用于研究或施测记录。", "Start with free recall. The cue section below is only for research or examiner notes.")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{t("已回忆", "Recalled")} {filledCount} / 5</Badge>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5" />
            <p className="text-base md:text-lg font-medium text-neutral-800">
              {t("请先在上方完成无提示回忆，不要先展开提示记录区。", "Complete the free recall section first before opening the cue notes area.")}
            </p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4">
                  <p className="text-sm font-semibold text-neutral-800">{t("无提示回忆", "Free Recall")}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t("这一部分对应正式得分，建议优先完成", "This section counts toward the official score and should be completed first")}</p>
                </div>

                <div className="bg-white p-5 md:p-6 grid gap-4 md:grid-cols-2">
                  {answers.map((value, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">{t("词语", "Word")} {index + 1}</label>
                      <input
                        value={value}
                        onChange={(e) => {
                          const next = [...answers];
                          next[index] = e.target.value;
                          setAnswers(next);
                        }}
                        placeholder={t("请输入你回忆到的词", "Enter the word you recalled")}
                        className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-base outline-none transition focus:border-neutral-500"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{t("提示记录区", "Cue Notes")}</p>
                    <p className="text-xs text-neutral-500 mt-1">{t("用于记录 category cue / multiple choice cue，不计入主分数", "Used to record category cues or multiple-choice cues and not counted toward the main score")}</p>
                  </div>
                  <Button onClick={() => setShowCues((v) => !v)} variant="outline" className="rounded-2xl">
                    {showCues ? t("收起提示记录", "Hide cue notes") : t("展开提示记录", "Show cue notes")}
                  </Button>
                </div>

                {showCues ? (
                  <div className="bg-white p-5 md:p-6 space-y-4">
                    {answers.map((_, index) => (
                      <div key={index} className="rounded-2xl border bg-neutral-50 px-4 py-4">
                        <p className="text-sm font-medium text-neutral-800">{t("词语", "Word")} {index + 1}</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <label className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm text-neutral-700">
                            <input
                              type="checkbox"
                              checked={categoryCues[index]}
                              onChange={(e) => {
                                const next = [...categoryCues];
                                next[index] = e.target.checked;
                                setCategoryCues(next);
                              }}
                            />
                            {t("使用了 Category Cue", "Category cue used")}
                          </label>
                          <label className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm text-neutral-700">
                            <input
                              type="checkbox"
                              checked={choiceCues[index]}
                              onChange={(e) => {
                                const next = [...choiceCues];
                                next[index] = e.target.checked;
                                setChoiceCues(next);
                              }}
                            />
                            {t("使用了 Multiple Choice Cue", "Multiple choice cue used")}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t("设计说明", "Design Notes")}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600 list-disc pl-5">
                    <li>{t("把无提示回忆和提示记录明确拆开，避免患者受暗示。", "Free recall and cue notes are separated clearly to avoid suggesting answers.")}</li>
                    <li>{t("主区域保持空白输入，不显示任何候选词。", "The main area remains a blank input area without showing any candidate words.")}</li>
                    <li>{t("提示记录区更适合研究版或医生端，而不是患者主流程。", "The cue notes area is better suited to research or clinician-facing versions, not the patient flow.")}</li>
                  </ul>
                </div>

                {showHelp && (
                  <div className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700 leading-6">
                    <p>{t("正式计分通常只看无提示回忆的 5 个词。", "Formal scoring usually considers only the 5 freely recalled words.")}</p>
                    <p className="mt-1">{t("如果后续要做更临床化版本，提示记录区建议放到施测者界面而不是患者界面。", "For a more clinical version, the cue notes section should probably live in the examiner interface rather than the patient interface.")}</p>
                  </div>
                )}

                <div className="grid gap-3">
                  <Button
                    onClick={() => {
                      setAnswers(["", "", "", "", ""]);
                      setCategoryCues([false, false, false, false, false]);
                      setChoiceCues([false, false, false, false, false]);
                    }}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />{t("清空本题", "Clear this task")}
                  </Button>

                  <Button
                    onClick={() => setShowHelp((v) => !v)}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />{showHelp ? t("收起帮助", "Hide help") : t("查看帮助", "Show help")}
                  </Button>

                  <Button onClick={onNext} disabled={filledCount === 0} className="h-12 justify-start rounded-2xl text-base">
                    <ArrowRight className="mr-2 h-4 w-4" />{t("下一题", "Next task")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AbstractionScreen({ onNext }: { onNext: () => void }) {
  const { t } = useI18n();
  const pairs = [
    { left: "Train", right: "Bicycle", hint: t("它们有什么相似之处？", "How are they alike?") },
    { left: "Watch", right: "Ruler", hint: t("它们有什么相似之处？", "How are they alike?") },
  ];
  const [answers, setAnswers] = useState(["", ""]);
  const [showHelp, setShowHelp] = useState(false);
  const filledCount = answers.filter((v) => v.trim().length > 0).length;

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{t("抽象题", "Abstraction")}</CardTitle>
            <p className="mt-2 text-base text-neutral-700 md:text-lg">{t("请说出每组物品之间的相似之处。", "Describe how each pair of items is similar.")}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("尽量用一句简短的话概括它们属于哪一类或共同用途。", "Use a short sentence to summarize their common category or shared function.")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{t("已填写", "Completed")} {filledCount} / 2</Badge>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5" />
            <p className="text-base md:text-lg font-medium text-neutral-800">
              {t("请填写它们的共同类别或共同功能，不需要分别解释两个词。", "Enter their shared category or common function. You do not need to explain each word separately.")}
            </p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            {pairs.map((pair, index) => (
              <Card key={index} className="rounded-3xl shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="border-b bg-neutral-50 px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{t("问题", "Question")} {index + 1}</p>
                      <p className="text-xs text-neutral-500 mt-1">{pair.hint}</p>
                    </div>
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                      {answers[index].trim() ? t("已填写", "Done") : t("未填写", "Empty")}
                    </Badge>
                  </div>

                  <div className="bg-white p-5 md:p-6 space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border bg-neutral-50 px-5 py-6 text-center">
                        <p className="text-sm text-neutral-500">{t("词语 A", "Word A")}</p>
                        <p className="mt-2 text-3xl font-semibold text-neutral-900">{pair.left}</p>
                      </div>
                      <div className="rounded-2xl border bg-neutral-50 px-5 py-6 text-center">
                        <p className="text-sm text-neutral-500">{t("词语 B", "Word B")}</p>
                        <p className="mt-2 text-3xl font-semibold text-neutral-900">{pair.right}</p>
                      </div>
                    </div>

                    <textarea
                      value={answers[index]}
                      onChange={(e) => {
                        const next = [...answers];
                        next[index] = e.target.value;
                        setAnswers(next);
                      }}
                      placeholder={t("请输入它们的相似之处", "Enter how they are similar")}
                      className="min-h-[120px] w-full resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-base leading-7 outline-none transition focus:border-neutral-500"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t("设计说明", "Design Notes")}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600 list-disc pl-5">
                    <li>{t("每组词单独成卡片，避免两题混在一起造成阅读负担。", "Each pair is shown on its own card to reduce reading load.")}</li>
                    <li>{t("把词语放大展示，问题本身只保留一句短提示。", "The words are displayed prominently while the prompt stays brief.")}</li>
                    <li>{t("正式版可在后台用关键词规则加人工复核一起判分。", "A production version can combine keyword rules with manual review in the backend.")}</li>
                  </ul>
                </div>

                {showHelp && (
                  <div className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700 leading-6">
                    <p>{t("例如可以回答“都是交通工具”或“都是测量工具”这类概括性表达。", "Examples of acceptable answers would be broad categories such as 'both are means of transportation' or 'both are measuring tools.'")}</p>
                    <p className="mt-1">{t("正式测评中不要给出具体示例提示。", "Specific example hints should not be shown in a formal assessment.")}</p>
                  </div>
                )}

                <div className="grid gap-3">
                  <Button
                    onClick={() => setAnswers(["", ""])}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />{t("清空答案", "Clear answers")}
                  </Button>

                  <Button
                    onClick={() => setShowHelp((v) => !v)}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />{showHelp ? t("收起帮助", "Hide help") : t("查看帮助", "Show help")}
                  </Button>

                  <Button onClick={onNext} disabled={filledCount === 0} className="h-12 justify-start rounded-2xl text-base">
                    <ArrowRight className="mr-2 h-4 w-4" />{t("下一题", "Next task")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LanguageFluencyScreen({ onNext }: { onNext: () => void }) {
  const { t } = useI18n();
  const [started, setStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [currentWord, setCurrentWord] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!started || secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [started, secondsLeft]);

  const finished = started && secondsLeft === 0;

  function addWord() {
    const trimmed = currentWord.trim();
    if (!trimmed) return;
    setWords((prev) => [...prev, trimmed]);
    setCurrentWord("");
  }

  function resetAll() {
    setStarted(false);
    setSecondsLeft(60);
    setCurrentWord("");
    setWords([]);
  }

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{t("词语流畅性", "Verbal Fluency")}</CardTitle>
            <p className="mt-2 text-base text-neutral-700 md:text-lg">{t("请在 60 秒内尽可能说出或输入更多以 F 开头的词。", "Within 60 seconds, say or enter as many words beginning with F as possible.")}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("不要使用人名、地名或同一个词的简单重复变化。", "Do not use names, places, or simple variations of the same word.")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{t("剩余", "Remaining")} {secondsLeft} {t("秒", "sec")}</Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{t("已记录", "Recorded")} {words.length}</Badge>
          </div>
        </div>

        <motion.div
          key={`${started}-${secondsLeft}-${words.length}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5" />
            <p className="text-base md:text-lg font-medium text-neutral-800">
              {!started
                ? t("点击“开始计时”后开始作答。请尽量快速输入以 F 开头的词。", "Click 'Start timer' to begin. Enter F-words as quickly as possible.")
                : finished
                ? t("时间到。本题结束。正式版可结合录音或人工复核判断有效词数。", "Time is up. This task is finished. A production version can combine audio recording with manual review to judge valid words.")
                : t("正在计时，请持续输入以 F 开头的词，并点击“添加”。", "The timer is running. Keep entering words that begin with F and click 'Add'.")}
            </p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{t("输入区", "Input Area")}</p>
                    <p className="text-xs text-neutral-500 mt-1">{t("原始任务更接近口头表达，这里先用持续输入原型来模拟", "The original task is closer to spoken output. This prototype simulates it with continuous text entry.")}</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    {finished ? t("已结束", "Finished") : started ? t("计时中", "Running") : t("未开始", "Not started")}
                  </Badge>
                </div>

                <div className="bg-white p-6 md:p-8 space-y-5">
                  <div className="rounded-[28px] border bg-neutral-50 p-5 md:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-neutral-500">{t("当前目标字母", "Target Letter")}</p>
                        <p className="mt-1 text-5xl font-semibold tracking-[0.2em] text-neutral-900">F</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-500">{t("剩余时间", "Time Left")}</p>
                        <p className="mt-1 text-4xl font-semibold text-neutral-900">{secondsLeft}s</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      value={currentWord}
                      onChange={(e) => setCurrentWord(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (started && !finished) addWord();
                        }
                      }}
                      placeholder={t("请输入一个以 F 开头的词", "Enter a word beginning with F")}
                      disabled={!started || finished}
                      className="h-14 flex-1 rounded-2xl border border-neutral-300 bg-white px-5 text-lg outline-none transition focus:border-neutral-500 disabled:bg-neutral-100"
                    />
                    <Button onClick={addWord} disabled={!started || finished || !currentWord.trim()} className="h-14 rounded-2xl px-6 text-base">
                      {t("添加词语", "Add word")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4">
                  <p className="text-sm font-semibold text-neutral-800">{t("已记录词语", "Recorded Words")}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t("正式版可在后台去重、检查开头字母并判断有效性", "A production version can deduplicate words, verify the initial letter, and judge validity in the backend.")}</p>
                </div>

                <div className="bg-white p-5 md:p-6">
                  {words.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-400">
                      {t("还没有记录任何词语", "No words have been recorded yet")}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {words.map((word, index) => (
                        <Badge key={`${word}-${index}`} variant="secondary" className="rounded-full px-4 py-2 text-sm">
                          {index + 1}. {word}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t("设计说明", "Design Notes")}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600 list-disc pl-5">
                    <li>{t("把任务核心收敛成“计时 + 持续输入 + 即时记录”。", "The task is reduced to its core: timer + continuous input + immediate recording.")}</li>
                    <li>{t("顶部始终显示剩余时间和已记录数量，降低焦虑感。", "The remaining time and word count stay visible at the top to reduce anxiety.")}</li>
                    <li>{t("正式版更适合录音 + ASR，再由后台人工复核有效词数。", "A production version is better served by audio capture plus ASR, followed by backend manual review.")}</li>
                  </ul>
                </div>

                {showHelp && (
                  <div className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700 leading-6">
                    <p>{t("这一题最接近口语流畅性任务，文本输入只是便于做原型演示。", "This task is closest to a spoken fluency task, and text entry is only used here for prototyping.")}</p>
                    <p className="mt-1">{t("临床或研究版本建议采集整段录音，再做自动转写与人工审核。", "Clinical or research versions should capture full audio, then apply transcription and manual review.")}</p>
                  </div>
                )}

                <div className="grid gap-3">
                  <Button
                    onClick={() => {
                      if (!started) {
                        setStarted(true);
                        setSecondsLeft(60);
                        return;
                      }
                      resetAll();
                    }}
                    variant={started ? "outline" : "default"}
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    {started ? <RotateCcw className="mr-2 h-4 w-4" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    {started ? t("重新开始", "Restart") : t("开始计时", "Start timer")}
                  </Button>

                  <Button
                    onClick={() => setShowHelp((v) => !v)}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />{showHelp ? t("收起帮助", "Hide help") : t("查看帮助", "Show help")}
                  </Button>

                  <Button onClick={onNext} disabled={!finished} className="h-12 justify-start rounded-2xl text-base">
                    <ArrowRight className="mr-2 h-4 w-4" />{t("下一题", "Next task")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LanguageRepeatScreen({ onNext }: { onNext: () => void }) {
  const { t } = useI18n();
  const prompts = [
    "I only know that John is the one to help today.",
    "The cat always hid under the couch when dogs were in the room.",
  ];
  const [current, setCurrent] = useState<0 | 1>(0);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState(["", ""]);
  const [showHelp, setShowHelp] = useState(false);

  const filledCount = answers.filter((v) => v.trim().length > 0).length;

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{t("句子复述", "Sentence Repetition")}</CardTitle>
            <p className="mt-2 text-base text-neutral-700 md:text-lg">{t("请尽量完整复述刚刚看到或听到的句子。", "Repeat the sentence you just saw or heard as completely as possible.")}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("这一题包含两句话，建议一句一句完成。", "This task contains two sentences, and it is best to complete them one at a time.")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{t("当前句子", "Current sentence")} {current + 1} / 2</Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{t("已填写", "Completed")} {filledCount} / 2</Badge>
          </div>
        </div>

        <motion.div
          key={`${current}-${revealed}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5" />
            <p className="text-base md:text-lg font-medium text-neutral-800">
              {revealed
                ? t("请看清这句话。准备好后，点击“开始复述”并输入你记住的完整句子。", "Read the sentence carefully. When ready, click 'Start repeating' and enter the full sentence you remember.")
                : t("请在下方输入你复述的句子，尽量保持原句完整。", "Enter the sentence you repeated below and keep it as complete as possible.")}
            </p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{t("句子呈现区", "Sentence Display")}</p>
                    <p className="text-xs text-neutral-500 mt-1">{t("正式版可替换成语音播报或限时展示", "A production version can switch this to audio playback or timed presentation")}</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    {revealed ? t("已显示", "Shown") : t("输入中", "Entering")}
                  </Badge>
                </div>

                <div className="bg-white p-6 md:p-8">
                  <div className={`rounded-[28px] border min-h-[180px] flex items-center justify-center px-6 py-8 text-center transition ${revealed ? "border-neutral-300 bg-neutral-50 text-neutral-900" : "border-dashed border-neutral-200 bg-white text-neutral-300"}`}>
                    <p className="max-w-3xl text-xl md:text-2xl leading-9 font-medium">
                      {revealed ? prompts[current] : "••••••••••••••••••••••••••••••••••••••"}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button onClick={() => setRevealed(true)} variant="outline" className="rounded-2xl">
                      {t("显示句子", "Show sentence")}
                    </Button>
                    <Button onClick={() => setRevealed(false)} variant="outline" className="rounded-2xl">
                      {t("开始复述", "Start repeating")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4">
                  <p className="text-sm font-semibold text-neutral-800">{t("输入复述内容", "Enter repeated sentence")}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t("建议单句作答，不做实时纠错", "Single-sentence input is recommended, with no real-time correction")}</p>
                </div>

                <div className="bg-white p-6 md:p-8 space-y-4">
                  <textarea
                    value={answers[current]}
                    onChange={(e) => {
                      const next = [...answers];
                      next[current] = e.target.value;
                      setAnswers(next);
                    }}
                    placeholder={t("请输入你复述的完整句子", "Enter the full sentence you repeated")}
                    className="min-h-[160px] w-full resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-base leading-7 outline-none transition focus:border-neutral-500"
                  />
                  <p className="text-sm text-neutral-500">{t("后端可以结合人工审核或语音识别结果进行评分。", "The backend can score this using manual review or speech-recognition results.")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t("设计说明", "Design Notes")}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600 list-disc pl-5">
                    <li>{t("每次只处理一句，避免两句同时出现造成记忆干扰。", "Only one sentence is handled at a time to reduce memory interference.")}</li>
                    <li>{t("展示区和输入区分开，更像“先听/看，再复述”的流程。", "The display and input areas are separated to better match a 'listen/look first, then repeat' flow.")}</li>
                    <li>{t("正式版建议加入麦克风录音，但第一版先用文本输入最稳。", "A production version should add microphone recording, but text input is the most stable first step.")}</li>
                  </ul>
                </div>

                {showHelp && (
                  <div className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700 leading-6">
                    <p>{t("这一题更接近口头复述，文本输入只是数字化原型近似方案。", "This task is closer to spoken repetition, and text input is only a digital prototype approximation.")}</p>
                    <p className="mt-1">{t("正式测评可记录录音，并允许后台人工复核。", "A formal assessment can capture audio and allow manual review in the backend.")}</p>
                  </div>
                )}

                <div className="grid gap-3">
                  <Button
                    onClick={() => {
                      const next = [...answers];
                      next[current] = "";
                      setAnswers(next);
                    }}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />{t("清空当前句子", "Clear current sentence")}
                  </Button>

                  {current === 0 ? (
                    <Button
                      onClick={() => {
                        setCurrent(1);
                        setRevealed(true);
                      }}
                      disabled={answers[0].trim().length === 0}
                      className="h-12 justify-start rounded-2xl text-base"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />{t("进入第 2 句", "Go to sentence 2")}
                    </Button>
                  ) : (
                    <Button onClick={onNext} disabled={answers[1].trim().length === 0} className="h-12 justify-start rounded-2xl text-base">
                      <ArrowRight className="mr-2 h-4 w-4" />{t("下一题", "Next task")}
                    </Button>
                  )}

                  <Button
                    onClick={() => setShowHelp((v) => !v)}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />{showHelp ? t("收起帮助", "Hide help") : t("查看帮助", "Show help")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SerialSevenScreen({ onNext }: { onNext: () => void }) {
  const { t } = useI18n();
  const [answers, setAnswers] = useState(["", "", "", "", ""]);
  const [showHelp, setShowHelp] = useState(false);
  const filledCount = answers.filter((v) => v.trim().length > 0).length;

  const placeholders = ["93", "86", "79", "72", "65"];

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{t("连减 7", "Serial 7s")}</CardTitle>
            <p className="mt-2 text-base text-neutral-700 md:text-lg">{t("请从 100 开始，每次减 7，并依次填写结果。", "Start from 100, subtract 7 each time, and enter the results in order.")}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("共填写 5 个答案，例如：100 → 93 → 86 ...", "Enter 5 answers, for example: 100 → 93 → 86 ...")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{t("已填写", "Completed")} {filledCount} / 5</Badge>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5" />
            <p className="text-base md:text-lg font-medium text-neutral-800">
              {t("请一步一步计算，每次都在上一个结果基础上再减 7。", "Calculate step by step, subtracting 7 from each previous result.")}
            </p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4">
                  <p className="text-sm font-semibold text-neutral-800">{t("分步作答", "Step-by-step entry")}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t("逐步填写比单个大输入框更清楚，也更接近施测过程", "Stepwise entry is clearer than one large input and better matches the real assessment flow")}</p>
                </div>

                <div className="bg-white p-5 md:p-8">
                  <div className="grid gap-4 md:grid-cols-5">
                    <div className="rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-5 text-center">
                      <p className="text-xs text-neutral-500">{t("起始数", "Start")}</p>
                      <p className="mt-2 text-3xl font-semibold tracking-wide text-neutral-900">100</p>
                    </div>

                    {answers.map((value, index) => (
                      <div key={index} className="rounded-2xl border border-neutral-200 bg-white px-4 py-4">
                        <p className="text-xs text-neutral-500">{t("第", "Step")} {index + 1}</p>
                        <p className="text-xs text-neutral-400 mt-1">{t("再减 7", "Subtract 7")}</p>
                        <input
                          value={value}
                          onChange={(e) => {
                            const next = [...answers];
                            next[index] = e.target.value.replace(/[^0-9-]/g, "");
                            setAnswers(next);
                          }}
                          inputMode="numeric"
                          placeholder={placeholders[index]}
                          className="mt-3 h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-center text-xl tracking-wide outline-none transition focus:border-neutral-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4">
                  <p className="text-sm font-semibold text-neutral-800">{t("书写节奏提示", "Pacing Tips")}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t("这块只做操作引导，不直接给答案", "This section only guides the process and does not reveal answers")}</p>
                </div>

                <div className="bg-white p-5 md:p-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border bg-neutral-50 px-4 py-4">
                    <p className="text-sm font-medium text-neutral-800">{t("先看起始数", "Start with the initial number")}</p>
                    <p className="mt-2 text-sm text-neutral-600">{t("从 100 开始。", "Begin from 100.")}</p>
                  </div>
                  <div className="rounded-2xl border bg-neutral-50 px-4 py-4">
                    <p className="text-sm font-medium text-neutral-800">{t("每次减 7", "Subtract 7 each time")}</p>
                    <p className="mt-2 text-sm text-neutral-600">{t("基于上一个结果继续往下算。", "Keep calculating from the previous answer.")}</p>
                  </div>
                  <div className="rounded-2xl border bg-neutral-50 px-4 py-4">
                    <p className="text-sm font-medium text-neutral-800">{t("共写 5 个答案", "Write 5 answers")}</p>
                    <p className="mt-2 text-sm text-neutral-600">{t("完成后进入下一题。", "Move to the next task when finished.")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t("设计说明", "Design Notes")}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600 list-disc pl-5">
                    <li>{t("把 5 次减法拆开，能明显降低患者理解负担。", "Breaking the task into 5 separate subtractions makes it easier to understand.")}</li>
                    <li>{t("输入框只接受数字，减少误输入。", "Inputs accept numbers only, which reduces entry mistakes.")}</li>
                    <li>{t("正式版可在后台按 0-3 分规则自动换算分数。", "A production version can automatically convert performance to the 0-3 scoring rule in the backend.")}</li>
                  </ul>
                </div>

                {showHelp && (
                  <div className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700 leading-6">
                    <p>{t("原始答案通常为：93、86、79、72、65。", "The standard answers are usually 93, 86, 79, 72, and 65.")}</p>
                    <p className="mt-1">{t("正式测评界面里不应向患者展示这组答案。", "Those answers should not be shown to patients in a formal assessment interface.")}</p>
                  </div>
                )}

                <div className="grid gap-3">
                  <Button
                    onClick={() => setAnswers(["", "", "", "", ""])}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />{t("清空答案", "Clear answers")}
                  </Button>

                  <Button
                    onClick={() => setShowHelp((v) => !v)}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />{showHelp ? t("收起帮助", "Hide help") : t("查看帮助", "Show help")}
                  </Button>

                  <Button onClick={onNext} disabled={filledCount === 0} className="h-12 justify-start rounded-2xl text-base">
                    <ArrowRight className="mr-2 h-4 w-4" />{t("下一题", "Next task")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AttentionAScreen({ onNext }: { onNext: () => void }) {
  const { t } = useI18n();
  const letters = ["F", "B", "A", "C", "M", "N", "A", "A", "J", "K", "L", "B", "A", "F", "A", "K", "D", "E", "A", "A", "A", "J", "A", "M", "O", "F", "A", "A", "B"];
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [taps, setTaps] = useState<number[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [buttonFlash, setButtonFlash] = useState<"idle" | "hit" | "miss">("idle");

  const currentLetter = started ? letters[Math.min(step, letters.length - 1)] : null;
  const progress = Math.min(step, letters.length);
  const finished = started && step >= letters.length;

  useEffect(() => {
    if (!started || finished) return;

    const timer = window.setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [finished, started, step]);

  useEffect(() => {
    if (buttonFlash === "idle") return;

    const timer = window.setTimeout(() => setButtonFlash("idle"), 180);
    return () => window.clearTimeout(timer);
  }, [buttonFlash]);

  function handleTap() {
    if (!started || finished) return;
    setTaps((prev) => [...prev, step]);
    setButtonFlash(currentLetter === "A" ? "hit" : "miss");
  }

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{t("A 点击题", "Tap on A")}</CardTitle>
            <p className="mt-2 text-base text-neutral-700 md:text-lg">{t("当你看到字母 A 时，请立即点击下方大按钮。", "When you see the letter A, click the large button below immediately.")}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("看到其他字母时不要点击。", "Do not click when any other letter appears.")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{t("进度", "Progress")} {progress} / {letters.length}</Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{t("点击", "Taps")} {taps.length}</Badge>
          </div>
        </div>

        <motion.div
          key={`${started}-${step}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5" />
            <p className="text-base md:text-lg font-medium text-neutral-800">
              {!started
                ? t("点击“开始演示”后，字母会一个一个出现。只有看到 A 时才点击。", "Click 'Start demo' and letters will appear one by one. Click only when you see A.")
                : finished
                ? t("本题已结束。正式版可根据命中、漏点和误点自动评分。", "This task is finished. A production version can score hits, misses, and false taps automatically.")
                : t("当前请专注看中央字母。只有出现 A 时才点击。", "Focus on the letter in the center. Click only when A appears.")}
            </p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{t("字母呈现区", "Letter Display")}</p>
                    <p className="text-xs text-neutral-500 mt-1">{t("点击开始后，字母会按每秒 1 个的固定节奏自动播放。", "After start, letters autoplay at a fixed pace of one per second.")}</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    {finished ? t("已结束", "Finished") : started ? t("进行中", "In progress") : t("未开始", "Not started")}
                  </Badge>
                </div>

                <div className="bg-white p-6 md:p-8">
                  <div className="rounded-[28px] border bg-neutral-50 min-h-[280px] flex flex-col items-center justify-center gap-6">
                    <motion.div
                      key={`${currentLetter}-${step}`}
                      initial={{ opacity: 0.25, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[88px] md:text-[120px] font-semibold tracking-[0.08em] text-neutral-900 leading-none"
                    >
                      {started && !finished ? currentLetter : "•"}
                    </motion.div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Button
                        onClick={() => {
                          setStarted(true);
                          setStep(0);
                          setTaps([]);
                          setButtonFlash("idle");
                        }}
                        variant="outline"
                        className="rounded-2xl"
                      >
                        {t("开始演示", "Start demo")}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4">
                  <p className="text-sm font-semibold text-neutral-800">{t("反应区", "Response Area")}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t("只有看到 A 时才点击这个按钮", "Click this button only when you see A")}</p>
                </div>

                <div className="bg-white p-6 md:p-8">
                  <motion.button
                    type="button"
                    onClick={handleTap}
                    whileTap={{ scale: 0.97 }}
                    animate={
                      buttonFlash === "hit"
                        ? { scale: [1, 0.98, 1.02, 1], backgroundColor: ["#f5f5f5", "#dcfce7", "#bbf7d0", "#f5f5f5"], borderColor: ["#d4d4d4", "#16a34a", "#16a34a", "#d4d4d4"] }
                        : buttonFlash === "miss"
                          ? { scale: [1, 0.98, 1.01, 1], backgroundColor: ["#f5f5f5", "#fee2e2", "#fecaca", "#f5f5f5"], borderColor: ["#d4d4d4", "#dc2626", "#dc2626", "#d4d4d4"] }
                          : { scale: 1, backgroundColor: "#f5f5f5", borderColor: "#d4d4d4" }
                    }
                    transition={{ duration: 0.2 }}
                    className="w-full rounded-[32px] border-2 px-6 py-12 md:py-16 text-2xl md:text-3xl font-semibold text-neutral-900 shadow-sm"
                  >
                    {t("看到 A 就点击这里", "Click here when you see A")}
                  </motion.button>
                  <p className="mt-4 text-sm text-neutral-500">{t("在正式测评中，这里可以记录每次点击的时间戳和对应字母位置。", "In a formal assessment, this area can record the timestamp and letter position for each tap.")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t("设计说明", "Design Notes")}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600 list-disc pl-5">
                    <li>{t("把“字母呈现区”和“大按钮反应区”分开，降低误触。", "Separating the letter display and the large response button reduces accidental taps.")}</li>
                    <li>{t("中央只显示一个大字母，减少视觉干扰。", "Only one large letter is shown in the center to reduce visual distraction.")}</li>
                    <li>{t("正式版应自动播放字母并自动计分，这里先保留原型控制按钮。", "A production version should autoplay letters and score automatically; prototype controls are kept here for now.")}</li>
                  </ul>
                </div>

                {showHelp && (
                  <div className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700 leading-6">
                    <p>{t("命中：出现 A 时点击。", "Hit: clicked when A appeared.")}</p>
                    <p className="mt-1">{t("误点：不是 A 却点击。", "False tap: clicked when the letter was not A.")}</p>
                    <p className="mt-1">{t("漏点：出现 A 但没有点击。", "Miss: A appeared but was not clicked.")}</p>
                  </div>
                )}

                <div className="grid gap-3">
                  <Button
                    onClick={() => {
                      setStarted(false);
                      setStep(0);
                      setTaps([]);
                      setButtonFlash("idle");
                    }}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />{t("重新开始", "Restart")}
                  </Button>

                  <Button onClick={() => setShowHelp((v) => !v)} variant="outline" className="h-12 justify-start rounded-2xl text-base">
                    <HelpCircle className="mr-2 h-4 w-4" />{showHelp ? t("收起帮助", "Hide help") : t("查看帮助", "Show help")}
                  </Button>

                  <Button onClick={onNext} disabled={!finished} className="h-12 justify-start rounded-2xl text-base">
                    <ArrowRight className="mr-2 h-4 w-4" />{t("下一题", "Next task")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AttentionDigitScreen({ onNext }: { onNext: () => void }) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<"forward" | "backward">("forward");
  const [revealed, setRevealed] = useState(false);
  const [forwardAnswer, setForwardAnswer] = useState("");
  const [backwardAnswer, setBackwardAnswer] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const sequence = phase === "forward" ? ["2", "1", "8", "5", "4"] : ["7", "4", "2"];
  const answer = phase === "forward" ? forwardAnswer : backwardAnswer;
  const setAnswer = phase === "forward" ? setForwardAnswer : setBackwardAnswer;
  const phaseTitle = phase === "forward" ? t("数字正向复述", "Forward Digit Span") : t("数字逆向复述", "Backward Digit Span");
  const phaseHint =
    phase === "forward"
      ? t("请按刚才看到的顺序输入数字。", "Enter the digits in the same order you saw them.")
      : t("请把刚才看到的数字倒过来输入。", "Enter the digits in reverse order.");

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{t("注意题", "Digit Span")}</CardTitle>
            <p className="mt-2 text-base text-neutral-700 md:text-lg">{t("请记住刚刚看到的数字，并按要求复述。", "Remember the digits you just saw and repeat them as instructed.")}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("本页包含数字正向复述与数字逆向复述两个部分。", "This page includes both forward and backward digit span tasks.")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{phase === "forward" ? t("正向", "Forward") : t("逆向", "Backward")}</Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">{t("长度", "Length")} {sequence.length}</Badge>
          </div>
        </div>

        <motion.div
          key={`${phase}-${revealed}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5" />
            <p className="text-base md:text-lg font-medium text-neutral-800">
              {revealed ? t("请看清数字。准备好后，点击“开始输入”。当前是", "Read the digits carefully. When ready, click 'Start input'. Current mode: ") + (phase === "forward" ? t("正向复述。", "forward span.") : t("逆向复述。", "backward span.")) : phaseHint}
            </p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{phaseTitle}</p>
                    <p className="text-xs text-neutral-500 mt-1">{t("正式版建议使用逐个播报或自动闪现数字", "A production version should present digits automatically, one by one or as a timed flash")}</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    {revealed ? t("已显示", "Shown") : t("输入中", "Entering")}
                  </Badge>
                </div>

                <div className="bg-white p-6 md:p-8">
                  <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5">
                    {sequence.map((digit, idx) => (
                      <div
                        key={`${phase}-${idx}`}
                        className={`rounded-2xl border px-4 py-6 text-center text-3xl font-semibold tracking-[0.2em] transition ${
                          revealed ? "border-neutral-300 bg-neutral-50 text-neutral-900" : "border-dashed border-neutral-200 bg-white text-neutral-300"
                        }`}
                      >
                        {revealed ? digit : "•"}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button onClick={() => setRevealed(true)} variant="outline" className="rounded-2xl">
                      {t("显示数字", "Show digits")}
                    </Button>
                    <Button onClick={() => setRevealed(false)} variant="outline" className="rounded-2xl">
                      {t("开始输入", "Start input")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4">
                  <p className="text-sm font-semibold text-neutral-800">{t("输入答案", "Enter answer")}</p>
                  <p className="text-xs text-neutral-500 mt-1">{phaseHint}</p>
                </div>

                <div className="bg-white p-6 md:p-8 space-y-4">
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder={phase === "forward" ? t("例如：21854", "Example: 21854") : t("例如：247", "Example: 247")}
                    inputMode="numeric"
                    className="h-14 w-full rounded-2xl border border-neutral-300 bg-white px-5 text-2xl tracking-[0.2em] outline-none transition focus:border-neutral-500"
                  />
                  <p className="text-sm text-neutral-500">{t("仅保留数字输入，避免其他字符干扰。", "Only numeric input is allowed to avoid distraction from other characters.")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t("设计说明", "Design Notes")}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600 list-disc pl-5">
                    <li>{t("把正向与逆向拆成两个 phase，减少患者混淆。", "Forward and backward tasks are split into two phases to reduce confusion.")}</li>
                    <li>{t("主区域只保留“显示数字”和“输入答案”两步，流程更紧凑。", "The main area keeps only two steps: show digits and enter answer.")}</li>
                    <li>{t("正式版可以替换成自动定时播放，无需患者自己点“显示数字”。", "A production version can play automatically without requiring the user to click 'Show digits'.")}</li>
                  </ul>
                </div>

                {showHelp && (
                  <div className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700 leading-6">
                    <p>{t("正向：按原顺序输入。", "Forward: enter the digits in the original order.")}</p>
                    <p className="mt-1">{t("逆向：把刚才看到的数字倒过来输入。", "Backward: enter the digits in reverse order.")}</p>
                  </div>
                )}

                <div className="grid gap-3">
                  <Button onClick={() => setAnswer("")} variant="outline" className="h-12 justify-start rounded-2xl text-base">
                    <RotateCcw className="mr-2 h-4 w-4" />{t("清空输入", "Clear input")}
                  </Button>

                  {phase === "forward" ? (
                    <Button
                      onClick={() => {
                        setPhase("backward");
                        setRevealed(true);
                      }}
                      disabled={forwardAnswer.trim().length === 0}
                      className="h-12 justify-start rounded-2xl text-base"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />{t("进入逆向复述", "Go to backward span")}
                    </Button>
                  ) : (
                    <Button onClick={onNext} disabled={backwardAnswer.trim().length === 0} className="h-12 justify-start rounded-2xl text-base">
                      <ArrowRight className="mr-2 h-4 w-4" />{t("下一题", "Next task")}
                    </Button>
                  )}

                  <Button onClick={() => setShowHelp((v) => !v)} variant="outline" className="h-12 justify-start rounded-2xl text-base">
                    <HelpCircle className="mr-2 h-4 w-4" />{showHelp ? t("收起帮助", "Hide help") : t("查看帮助", "Show help")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MemoryLearningScreen({ onNext }: { onNext: () => void }) {
  const { t } = useI18n();
  const words = ["FACE", "VELVET", "CHURCH", "DAISY", "RED"];
  const [trial, setTrial] = useState<1 | 2>(1);
  const [revealed, setRevealed] = useState(false);
  const [answers1, setAnswers1] = useState(["", "", "", "", ""]);
  const [answers2, setAnswers2] = useState(["", "", "", "", ""]);
  const [showHelp, setShowHelp] = useState(false);

  const currentAnswers = trial === 1 ? answers1 : answers2;
  const setCurrentAnswers = trial === 1 ? setAnswers1 : setAnswers2;
  const filledCount = currentAnswers.filter((v) => v.trim().length > 0).length;
  const canMoveToTrial2 = trial === 1 && answers1.some((v) => v.trim().length > 0);
  const canFinish = trial === 2 && answers2.some((v) => v.trim().length > 0);

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{t("记忆题", "Memory")}</CardTitle>
            <p className="mt-2 text-base text-neutral-700 md:text-lg">{t("请记住这 5 个词，并在看到后尽量复述出来。", "Remember these 5 words and repeat them as well as you can after seeing them.")}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("这一部分包含两轮重复，后面还会再次回忆这些词。", "This section includes two learning trials, and the words will be recalled again later.")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
              {t("第", "Trial ")} {trial}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
              {t("已填写", "Completed")} {filledCount} / 5
            </Badge>
          </div>
        </div>

        <motion.div
          key={`${trial}-${revealed}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5" />
            <p className="text-base md:text-lg font-medium text-neutral-800">
              {revealed
                ? `${t("请看清这 5 个词。准备好后，点击“开始输入”。当前为第", "Read these 5 words carefully. When ready, click 'Start input'. Current trial:")} ${trial} ${t("轮。", ".")}`
                : `${t("请在下方输入你刚刚记住的词。当前为第", "Enter the words you just remembered below. Current trial:")} ${trial} ${t("轮。", ".")}`}
            </p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{t("词语展示区", "Word Display")}</p>
                    <p className="text-xs text-neutral-500 mt-1">{t("正式版可以替换成语音播报或限时呈现", "A production version can replace this with audio playback or timed presentation")}</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    {revealed ? t("已显示", "Shown") : t("未显示", "Hidden")}
                  </Badge>
                </div>

                <div className="bg-white p-6 md:p-8">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {words.map((word) => (
                      <div
                        key={word}
                        className={`rounded-2xl border px-4 py-5 text-center text-lg font-semibold tracking-wide transition ${
                          revealed ? "border-neutral-300 bg-neutral-50 text-neutral-900" : "border-dashed border-neutral-200 bg-white text-neutral-300"
                        }`}
                      >
                        {revealed ? word : "•••••"}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button onClick={() => setRevealed(true)} variant="outline" className="rounded-2xl">
                      {t("显示词语", "Show words")}
                    </Button>
                    <Button onClick={() => setRevealed(false)} variant="outline" className="rounded-2xl">
                      {t("开始输入", "Start input")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b bg-neutral-50 px-5 py-4">
                  <p className="text-sm font-semibold text-neutral-800">{t("第", "Trial ")} {trial} {t("轮复述", "recall")}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t("顺序不一定必须一致，先尽量填出你记住的词", "The order does not have to match exactly. First enter as many words as you remember.")}</p>
                </div>

                <div className="bg-white p-5 md:p-6 grid gap-4 md:grid-cols-2">
                  {currentAnswers.map((value, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">{t("词语", "Word")} {index + 1}</label>
                      <input
                        value={value}
                        onChange={(e) => {
                          const next = [...currentAnswers];
                          next[index] = e.target.value;
                          setCurrentAnswers(next);
                        }}
                        placeholder={t("请输入你记住的词", "Enter a word you remember")}
                        className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-base outline-none transition focus:border-neutral-500"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t("设计说明", "Design Notes")}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600 list-disc pl-5">
                    <li>{t("分成“词语展示区”和“复述输入区”，流程更清晰。", "Separating the word display and recall input areas makes the flow clearer.")}</li>
                    <li>{t("支持两轮重复，为后面的延迟回忆做铺垫。", "Two learning trials are supported to prepare for delayed recall later.")}</li>
                    <li>{t("正式版可以隐藏文字展示，只保留语音播报与计时。", "A production version can hide the text display and keep only audio presentation and timing.")}</li>
                  </ul>
                </div>

                {showHelp && (
                  <div className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700 leading-6">
                    <p>{t("研究版可记录每轮正确数量、输入顺序与作答时间。", "A research version can record the number of correct responses, input order, and response time for each trial.")}</p>
                    <p className="mt-1">{t("正式测评中，这里通常不显示答案对错。", "A formal assessment would typically not show whether the answers are correct here.")}</p>
                  </div>
                )}

                <div className="grid gap-3">
                  <Button
                    onClick={() => setCurrentAnswers(["", "", "", "", ""])}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />{t("清空本轮输入", "Clear this trial")}
                  </Button>

                  {trial === 1 ? (
                    <Button
                      onClick={() => {
                        setTrial(2);
                        setRevealed(true);
                      }}
                      disabled={!canMoveToTrial2}
                      className="h-12 justify-start rounded-2xl text-base"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />{t("进入第 2 轮", "Go to trial 2")}
                    </Button>
                  ) : (
                    <Button onClick={onNext} disabled={!canFinish} className="h-12 justify-start rounded-2xl text-base">
                      <ArrowRight className="mr-2 h-4 w-4" />{t("下一题", "Next task")}
                    </Button>
                  )}

                  <Button
                    onClick={() => setShowHelp((v) => !v)}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />{showHelp ? t("收起帮助", "Hide help") : t("查看帮助", "Show help")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NamingScreen({ onNext }: { onNext: () => void }) {
  const { t } = useI18n();
  const [answers, setAnswers] = useState({ lion: "", rhino: "", camel: "" });
  const [showHelp, setShowHelp] = useState(false);

  const filledCount = Object.values(answers).filter((v) => v.trim().length > 0).length;

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{t("命名题", "Naming")}</CardTitle>
            <p className="mt-2 text-base text-neutral-700 md:text-lg">{t("请在下方输入每张图片中动物的名称。", "Enter the name of the animal shown in each picture below.")}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("请根据图片填写，不会实时显示对错。", "Answer based on the picture. Correctness is not shown in real time.")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
              {t("已填写", "Completed")} {filledCount} / 3
            </Badge>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5" />
            <p className="text-base md:text-lg font-medium text-neutral-800">
              {t("请根据图片输入动物名称，不确定时也可以先填写你认为最接近的答案。", "Enter the animal name based on the picture. If unsure, you can still enter your best guess.")}
            </p>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
          <div className="grid gap-5 md:grid-cols-3">
            <AnimalCard
              index={1}
              nameKey="lion"
              label={t("动物 1", "Animal 1")}
              value={answers.lion}
              placeholder={t("请输入名称", "Enter name")}
              onChange={(value) => setAnswers((prev) => ({ ...prev, lion: value }))}
            >
              <LionIllustration />
            </AnimalCard>

            <AnimalCard
              index={2}
              nameKey="rhino"
              label={t("动物 2", "Animal 2")}
              value={answers.rhino}
              placeholder={t("请输入名称", "Enter name")}
              onChange={(value) => setAnswers((prev) => ({ ...prev, rhino: value }))}
            >
              <RhinoIllustration />
            </AnimalCard>

            <AnimalCard
              index={3}
              nameKey="camel"
              label={t("动物 3", "Animal 3")}
              value={answers.camel}
              placeholder={t("请输入名称", "Enter name")}
              onChange={(value) => setAnswers((prev) => ({ ...prev, camel: value }))}
            >
              <CamelIllustration />
            </AnimalCard>
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t("设计说明", "Design Notes")}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600 list-disc pl-5">
                    <li>{t("三张图同屏展示，更接近原始命名流程。", "Showing all three images on one screen is closer to the original naming flow.")}</li>
                    <li>{t("不提供候选项，不把命名题变成选择题。", "No candidate options are provided, so the naming task does not turn into multiple choice.")}</li>
                    <li>{t("正式评分可在后台做中英文同义词匹配。", "A production scorer can match Chinese and English synonyms in the backend.")}</li>
                  </ul>
                </div>

                {showHelp && (
                  <div className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700 leading-6">
                    <p>{t("可接受中英文输入，例如 lion / 狮子。", "Chinese and English inputs can both be accepted, such as lion / 狮子.")}</p>
                    <p className="mt-1">{t("正式测评时不要展示任何自动纠错结果。", "A formal assessment should not display auto-correction results.")}</p>
                  </div>
                )}

                <div className="grid gap-3">
                  <Button
                    onClick={() => setAnswers({ lion: "", rhino: "", camel: "" })}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />{t("清空答案", "Clear answers")}
                  </Button>

                  <Button
                    onClick={() => setShowHelp((v) => !v)}
                    variant="outline"
                    className="h-12 justify-start rounded-2xl text-base"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />{showHelp ? t("收起帮助", "Hide help") : t("查看帮助", "Show help")}
                  </Button>

                  <Button onClick={onNext} className="h-12 justify-start rounded-2xl text-base">
                    <ArrowRight className="mr-2 h-4 w-4" />{t("下一题", "Next task")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnimalCard({
  index,
  label,
  value,
  placeholder,
  onChange,
  children,
}: {
  index: number;
  nameKey: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <Card className="rounded-3xl shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="border-b bg-neutral-50 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-800">{label}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{t("题目", "Item")} {index}</p>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            {value.trim() ? t("已填写", "Done") : t("未填写", "Empty")}
          </Badge>
        </div>

        <div className="h-[280px] flex items-center justify-center bg-white p-4">
          {children}
        </div>

        <div className="px-4 pb-4">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-base outline-none transition focus:border-neutral-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function LionIllustration() {
  return (
    <svg viewBox="0 0 220 180" className="h-[210px] w-full max-w-[220px]">
      <g fill="none" stroke="#171717" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="92" cy="72" r="34" />
        <circle cx="92" cy="72" r="22" fill="#fff" />
        <path d="M114 86c18 0 34 10 42 22" />
        <path d="M118 102h28" />
        <path d="M157 104l14-12" />
        <path d="M156 104l13 12" />
        <path d="M70 103l-14 18" />
        <path d="M87 104l-8 22" />
        <path d="M126 108l6 22" />
        <path d="M144 110l10 20" />
        <path d="M78 68c5-6 11-9 18-9 8 0 14 3 19 9" />
        <path d="M84 78c6 4 12 4 18 0" />
        <path d="M92 78v8" />
        <path d="M74 52l-10-8" />
        <path d="M110 52l10-8" />
      </g>
    </svg>
  );
}

function RhinoIllustration() {
  return (
    <svg viewBox="0 0 220 180" className="h-[210px] w-full max-w-[220px]">
      <g fill="none" stroke="#171717" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M35 108c8-26 32-42 73-42 26 0 47 7 60 19 8 8 14 18 16 31H54" />
        <path d="M184 108c0 18-15 32-33 32H82c-28 0-47-12-47-32" />
        <path d="M154 64l17-14 10 7-10 12" />
        <path d="M169 50l14-11 7 4-8 10" />
        <path d="M58 108l-8 25" />
        <path d="M91 108v27" />
        <path d="M129 108v28" />
        <path d="M160 108l5 26" />
        <circle cx="145" cy="78" r="2" fill="#171717" />
        <path d="M121 86c7 4 13 4 19 0" />
      </g>
    </svg>
  );
}

function CamelIllustration() {
  return (
    <svg viewBox="0 0 220 180" className="h-[210px] w-full max-w-[220px]">
      <g fill="none" stroke="#171717" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M34 111h18c2-24 11-41 27-41 11 0 19 9 22 22 4-20 14-33 29-33 16 0 25 16 28 42h22" />
        <path d="M180 111c0 18-15 31-33 31H73c-24 0-39-13-39-31" />
        <path d="M149 111v31" />
        <path d="M113 111v31" />
        <path d="M77 111v31" />
        <path d="M52 111v31" />
        <path d="M176 80c7 0 13 6 13 13v18" />
        <path d="M174 80l10-15" />
        <circle cx="170" cy="87" r="2" fill="#171717" />
      </g>
    </svg>
  );
}

function ReferencePanel({ mode }: { mode: "cube" | "clock" }) {
  const { t } = useI18n();
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm font-semibold text-neutral-800">{t("参考图形", "Reference Figure")}</p>
        <div className="mt-4 rounded-[24px] border bg-neutral-50 p-4 h-[520px] flex items-center justify-center">
          {mode === "cube" ? <CubeReference /> : <ClockReference />}
        </div>
      </CardContent>
    </Card>
  );
}

function CubeReference() {
  return (
    <svg viewBox="0 0 180 180" className="h-[240px] w-[240px]">
      <g fill="none" stroke="#171717" strokeWidth="3">
        <rect x="38" y="48" width="74" height="74" />
        <rect x="64" y="24" width="74" height="74" />
        <line x1="38" y1="48" x2="64" y2="24" />
        <line x1="112" y1="48" x2="138" y2="24" />
        <line x1="38" y1="122" x2="64" y2="98" />
        <line x1="112" y1="122" x2="138" y2="98" />
        <line x1="64" y1="98" x2="138" y2="98" />
        <line x1="138" y1="24" x2="138" y2="98" />
      </g>
    </svg>
  );
}

function ClockReference() {
  const { t } = useI18n();
  return (
    <div className="w-full max-w-[220px] text-center">
      <div className="mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-full border-[4px] border-neutral-900 bg-white relative">
        {[...Array(12)].map((_, idx) => {
          const n = idx + 1;
          const angle = ((n - 3) * Math.PI) / 6;
          const x = 110 + Math.cos(angle) * 78;
          const y = 110 + Math.sin(angle) * 78;
          return (
            <span
              key={n}
              className="absolute text-sm font-semibold text-neutral-800"
              style={{ left: x - 6, top: y - 10 }}
            >
              {n}
            </span>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-neutral-600">{t("请画一个时钟，并将时间设置为 11:10", "Draw a clock and set the time to 11:10")}</p>
    </div>
  );
}
