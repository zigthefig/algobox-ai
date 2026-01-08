import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Bell,
  Palette,
  Code2,
  Shield,
  Zap,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingsSections = [
  { id: "profile", label: "Profile", icon: <User className="h-5 w-5" /> },
  { id: "preferences", label: "Preferences", icon: <Palette className="h-5 w-5" /> },
  { id: "editor", label: "Editor", icon: <Code2 className="h-5 w-5" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
  { id: "ai", label: "AI Settings", icon: <Zap className="h-5 w-5" /> },
  { id: "privacy", label: "Privacy", icon: <Shield className="h-5 w-5" /> },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 border-r border-border p-6"
      >
        <h1 className="text-xl font-semibold mb-6">Settings</h1>
        <nav className="space-y-1">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                activeSection === section.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 overflow-auto p-8"
      >
        {activeSection === "profile" && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold mb-2">Profile</h2>
            <p className="text-muted-foreground mb-8">Manage your account information</p>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-glow-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  JD
                </div>
                <Button variant="outline">Change Avatar</Button>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="johndoe" />
              </div>

              <Button>Save Changes</Button>
            </div>
          </div>
        )}

        {activeSection === "preferences" && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold mb-2">Preferences</h2>
            <p className="text-muted-foreground mb-8">Customize your experience</p>

            <div className="space-y-8">
              <div>
                <h3 className="font-medium mb-4">Theme</h3>
                <div className="flex gap-3">
                  {[
                    { id: "dark", icon: <Moon className="h-5 w-5" />, label: "Dark" },
                    { id: "light", icon: <Sun className="h-5 w-5" />, label: "Light" },
                    { id: "system", icon: <Monitor className="h-5 w-5" />, label: "System" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id as typeof theme)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
                        theme === option.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {option.icon}
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show hints automatically</Label>
                    <p className="text-sm text-muted-foreground">Display hints after multiple failed attempts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable keyboard shortcuts</Label>
                    <p className="text-sm text-muted-foreground">Use keyboard shortcuts throughout the app</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound effects</Label>
                    <p className="text-sm text-muted-foreground">Play sounds on achievements and milestones</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "editor" && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold mb-2">Editor Settings</h2>
            <p className="text-muted-foreground mb-8">Configure your coding environment</p>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Input id="fontSize" type="number" defaultValue="14" className="w-24" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tabSize">Tab Size</Label>
                <Input id="tabSize" type="number" defaultValue="2" className="w-24" />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Word Wrap</Label>
                    <p className="text-sm text-muted-foreground">Wrap long lines of code</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Minimap</Label>
                    <p className="text-sm text-muted-foreground">Display code overview on the side</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-complete</Label>
                    <p className="text-sm text-muted-foreground">Show code suggestions while typing</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Format on Save</Label>
                    <p className="text-sm text-muted-foreground">Automatically format code when saving</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold mb-2">Notifications</h2>
            <p className="text-muted-foreground mb-8">Control how you receive updates</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded to practice daily</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Streak alerts</Label>
                  <p className="text-sm text-muted-foreground">Notify when streak is at risk</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>New content alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new problems and features</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Achievement notifications</Label>
                  <p className="text-sm text-muted-foreground">Celebrate your milestones</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        )}

        {activeSection === "ai" && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold mb-2">AI Settings</h2>
            <p className="text-muted-foreground mb-8">Configure AI assistance preferences</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>AI debugging hints</Label>
                  <p className="text-sm text-muted-foreground">Allow AI to suggest fixes for your code</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Adaptive difficulty</Label>
                  <p className="text-sm text-muted-foreground">Let AI adjust problem difficulty based on performance</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Detailed explanations</Label>
                  <p className="text-sm text-muted-foreground">Receive in-depth explanations from AI</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Code generation</Label>
                  <p className="text-sm text-muted-foreground">Allow AI to generate solution code (may affect learning)</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        )}

        {activeSection === "privacy" && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold mb-2">Privacy & Security</h2>
            <p className="text-muted-foreground mb-8">Manage your data and privacy settings</p>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public profile</Label>
                    <p className="text-sm text-muted-foreground">Show your profile to other users</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show on leaderboard</Label>
                    <p className="text-sm text-muted-foreground">Display your ranking publicly</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics data</Label>
                    <p className="text-sm text-muted-foreground">Help improve Algobox with anonymous usage data</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Export My Data
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
