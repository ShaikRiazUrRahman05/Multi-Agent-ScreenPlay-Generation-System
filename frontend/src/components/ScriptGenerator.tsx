import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wand2, Pen, Users, MessageSquare, FileText, Sparkles, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { apiRun } from "@/lib/api";
import { markdownToHtml } from "@/lib/markdown";
import { diffLines } from "@/lib/diff";

interface ScriptData {
  outline: string;
  characters: string;
  dialogues: string;
  finalScript: string;
}

const ScriptGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("outline");
  const [scriptData, setScriptData] = useState<ScriptData>({
    outline: "",
    characters: "",
    dialogues: "",
    finalScript: ""
  });
  const [targetScene, setTargetScene] = useState<number | "">("");
  const [previousDialogues, setPreviousDialogues] = useState<string>("");

  const generateContent = async (type: "full" | "scene" | "character" | "plot") => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate your script");
      return;
    }

    setIsGenerating(true);
    try {
      const payload: any = { user_input: prompt };
      if (type === "scene") {
        payload.user_action = "rewrite_scene";
        if (targetScene) payload.target_scene = Number(targetScene);
      }
      else if (type === "character") payload.user_action = "rewrite_characters";
      else if (type === "plot") payload.user_action = "rewrite_plot";
      else payload.user_action = "full_run";

      if (type === "scene") {
        setPreviousDialogues(scriptData.dialogues);
      }

      const res = await apiRun(payload);
      setScriptData({
        outline: res.outline || "",
        characters: res.characters || "",
        dialogues: (res.dialogues || []).join("\n\n"),
        finalScript: res.final_script || "",
      });
      toast.success(`${type === "full" ? "Full script" : `${type} action`} completed`);
    } catch (err: any) {
      toast.error(err.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!scriptData.outline && !scriptData.characters && !scriptData.dialogues && !scriptData.finalScript) {
      toast.error("Nothing to download. Generate content first.");
      return;
    }

    const escapeHtml = (input: string) =>
      input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const title = (prompt || "AI Script").slice(0, 80);
    const now = new Date().toLocaleString();

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)} - ScriptAI</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;800&family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Fira+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
      html, body { margin: 0; padding: 0; }
      body { font-family: 'Source Serif 4', Georgia, Cambria, 'Times New Roman', Times, serif; color: #0f172a; }
      .container { width: 210mm; margin: 0 auto; padding: 18mm 14mm; }
      h1, h2, h3 { font-family: 'Playfair Display', Georgia, 'Times New Roman', Times, serif; margin: 0 0 10px; }
      h1 { font-size: 28pt; margin-bottom: 6mm; }
      h2 { font-size: 18pt; margin-top: 10mm; }
      h3 { font-size: 14pt; margin-top: 6mm; }
      p { font-size: 11.5pt; line-height: 1.55; margin: 0 0 6px; }
      ul, ol { font-size: 11.5pt; line-height: 1.55; margin: 0 0 6px 20px; }
      strong { font-weight: 700; }
      em { font-style: italic; }
      .muted { color: #475569; font-size: 10.5pt; }
      .section { page-break-inside: avoid; }
      .break { page-break-before: always; }
      pre { white-space: pre-wrap; font-family: 'Fira Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 10.5pt; line-height: 1.6; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; color: #0f172a; }
      hr { border: none; border-top: 1px solid #e2e8f0; margin: 10mm 0 6mm; }
      @page { size: A4; margin: 12mm; }
      @media print { .container { width: auto; margin: 0; padding: 0; } }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>${escapeHtml(title)}</h1>
      <div class="muted">Generated: ${escapeHtml(now)}</div>

      ${scriptData.outline ? `
        <hr />
        <div class="section">
          <h2>Overview</h2>
          ${markdownToHtml(scriptData.outline)}
        </div>
      ` : ''}

      ${scriptData.characters ? `
        <hr />
        <div class="section break">
          <h2>Character Bios</h2>
          ${markdownToHtml(scriptData.characters)}
        </div>
      ` : ''}

      ${scriptData.dialogues ? `
        <hr />
        <div class="section break">
          <h2>Dialogues</h2>
          ${markdownToHtml(scriptData.dialogues)}
        </div>
      ` : ''}

      ${scriptData.finalScript ? `
        <hr />
        <div class="section break">
          <h2>Final Script</h2>
          <pre>${escapeHtml(scriptData.finalScript)}</pre>
        </div>
      ` : ''}
    </div>
    <script>
      window.onload = function(){
        setTimeout(function(){
          window.print();
        }, 300);
      }
    </script>
  </body>
</html>`;

    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Popup blocked. Allow popups to download PDF.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const chatOptions = [
    { type: "full", label: "Full Run", icon: Play, description: "Generate complete script" },
    { type: "scene", label: "Rewrite Scene", icon: Pen, description: "Modify specific scenes" },
    { type: "character", label: "Rewrite Characters", icon: Users, description: "Adjust character development" },
    { type: "plot", label: "Rewrite Plot", icon: RotateCcw, description: "Revise story structure" }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            AI Script Generator
          </h1>
          <p className="text-xl text-muted-foreground">
            Transform your ideas into professional scripts with AI-powered creativity
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input & Chat Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prompt Input */}
            <Card className="card-creative">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Your Story Idea</h3>
                </div>
                <Textarea
                  placeholder="Describe your script idea... (e.g., 'A detective investigating corporate corruption discovers a conspiracy that goes deeper than expected')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="input-creative min-h-32 resize-none"
                />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Target Scene (for rewrite)</label>
                  <input
                    type="number"
                    min={1}
                    value={targetScene}
                    onChange={(e) => setTargetScene(e.target.value === "" ? "" : Number(e.target.value))}
                    className="input-creative w-full mt-1"
                    placeholder="e.g., 3"
                  />
                </div>
              </div>
              </div>
            </Card>

            {/* Generation Options */}
            <Card className="card-creative">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-secondary" />
                  <h3 className="font-semibold">Generation Options</h3>
                </div>
                <div className="grid gap-3">
                  {chatOptions.map((option) => (
                    <Button
                      key={option.type}
                      variant="outline"
                      className="justify-start h-auto p-4 hover:bg-primary/10 hover:border-primary transition-all"
                      onClick={() => generateContent(option.type as any)}
                      disabled={isGenerating}
                    >
                      <option.icon className="w-4 h-4 mr-3 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    </Button>
                  ))}
                  <Button
                    onClick={handleDownloadPdf}
                    variant="default"
                    className="justify-center h-auto p-4 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90"
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Output Tabs Panel */}
          <div className="lg:col-span-2">
            <Card className="card-creative h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/20">
                  <TabsTrigger value="outline" className="tab-creative">
                    <FileText className="w-4 h-4 mr-2" />
                    Outline
                  </TabsTrigger>
                  <TabsTrigger value="characters" className="tab-creative">
                    <Users className="w-4 h-4 mr-2" />
                    Characters
                  </TabsTrigger>
                  <TabsTrigger value="dialogues" className="tab-creative">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Dialogues
                  </TabsTrigger>
                  <TabsTrigger value="script" className="tab-creative">
                    <FileText className="w-4 h-4 mr-2" />
                    Final Script
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6 h-[500px] overflow-auto">
                  <TabsContent value="outline" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Story Outline</h3>
                        <Badge variant="outline" className="border-primary text-primary">
                          Structure
                        </Badge>
                      </div>
                      {isGenerating ? (
                        <div className="flex items-center justify-center h-40">
                          <Sparkles className="w-10 h-10 text-primary animate-twinkle" />
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-script max-w-none">
                          {scriptData.outline ? (
                            <div
                              className="text-sm leading-6 bg-muted/10 p-4 rounded-lg shadow-sm"
                              dangerouslySetInnerHTML={{ __html: markdownToHtml(scriptData.outline) }}
                            />
                          ) : (
                          <pre className="whitespace-pre-wrap text-sm bg-muted/20 p-4 rounded-lg">
                              {"Generate your script to see the outline here..."}
                          </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="characters" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Character Profiles</h3>
                        <Badge variant="outline" className="border-secondary text-secondary">
                          Development
                        </Badge>
                      </div>
                      {isGenerating ? (
                        <div className="flex items-center justify-center h-40">
                          <Sparkles className="w-10 h-10 text-secondary animate-twinkle" />
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-script max-w-none">
                          {scriptData.characters ? (
                            <div
                              className="text-sm leading-6 bg-muted/10 p-4 rounded-lg shadow-sm"
                              dangerouslySetInnerHTML={{ __html: markdownToHtml(scriptData.characters) }}
                            />
                          ) : (
                          <pre className="whitespace-pre-wrap text-sm bg-muted/20 p-4 rounded-lg">
                              {"Generate your script to see character profiles here..."}
                          </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="dialogues" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Key Dialogues</h3>
                        <Badge variant="outline" className="border-accent text-accent">
                          Conversations
                        </Badge>
                      </div>
                      {isGenerating ? (
                        <div className="flex items-center justify-center h-40">
                          <Sparkles className="w-10 h-10 text-accent animate-twinkle" />
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-script max-w-none space-y-6">
                          {scriptData.dialogues ? (
                            <>
                              <div
                                className="text-sm leading-6 bg-muted/10 p-4 rounded-lg shadow-sm"
                                dangerouslySetInnerHTML={{ __html: markdownToHtml(scriptData.dialogues) }}
                              />
                              {previousDialogues && targetScene ? (
                                <div className="bg-muted/10 p-4 rounded-lg border border-border">
                                  <div className="text-sm font-semibold mb-2">Scene {targetScene} changes</div>
                                  <div
                                    className="text-xs leading-6 [&_del]:line-through [&_del]:text-red-400 [&_ins]:no-underline [&_ins]:text-green-400"
                                    dangerouslySetInnerHTML={{ __html: diffLines(previousDialogues, scriptData.dialogues) }}
                                  />
                                </div>
                              ) : null}
                            </>
                          ) : (
                            <pre className="whitespace-pre-wrap text-sm bg-muted/20 p-4 rounded-lg">
                              {"Generate your script to see dialogues here..."}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="script" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Final Script</h3>
                        <Badge variant="outline" className="border-primary text-primary">
                          Production Ready
                        </Badge>
                      </div>
                      {isGenerating ? (
                        <div className="flex items-center justify-center h-40">
                          <Sparkles className="w-10 h-10 text-primary animate-twinkle" />
                        </div>
                      ) : (
                        <div className="prose prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap text-sm bg-muted/20 p-4 rounded-lg script-mono leading-7">
                            {scriptData.finalScript || "Generate your script to see the final formatted script here..."}
                          </pre>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptGenerator;