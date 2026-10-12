import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { User, Key, Settings, Mail, Phone, MapPin, Briefcase, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { apiGetProfile, apiUpdateApiSettings, apiUpdateProfile } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [showApiKey, setShowApiKey] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    profession: "",
    company: "",
  });
  
  const [apiSettings, setApiSettings] = useState({
    useOwnKey: false,
    openaiKey: "",
    keyActive: true,
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { firstName, lastName, phone, location, bio, profession, company } = profileData;
      const res = await apiUpdateProfile({ firstName, lastName, phone, location, bio, profession, company });
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleApiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiUpdateApiSettings(apiSettings);
      toast.success("API settings updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update API settings");
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        const res = await apiGetProfile();
        setProfileData({
          firstName: res.firstName || "",
          lastName: res.lastName || "",
          email: res.email || "",
          phone: res.phone || "",
          location: res.location || "",
          bio: res.bio || "",
          profession: res.profession || "",
          company: res.company || "",
        });
        setApiSettings({
          useOwnKey: res.apiSettings?.useOwnKey ?? false,
          openaiKey: res.apiSettings?.openaiKey ?? "",
          keyActive: res.apiSettings?.keyActive ?? true,
        });
      } catch (err: any) {
        toast.error(err.message || "Failed to load profile");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and API preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="tab-creative">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="api" className="tab-creative">
              <Key className="w-4 h-4 mr-2" />
              API Settings
            </TabsTrigger>
            <TabsTrigger value="preferences" className="tab-creative">
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="card-creative">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and professional information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        className="input-creative"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        className="input-creative"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        className="input-creative pl-10"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="phone"
                          className="input-creative pl-10"
                          placeholder="+1 (555) 123-4567"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="location"
                          className="input-creative pl-10"
                          placeholder="New York, NY"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profession">Profession</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="profession"
                          className="input-creative pl-10"
                          placeholder="Screenwriter"
                          value={profileData.profession}
                          onChange={(e) => setProfileData({ ...profileData, profession: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        className="input-creative"
                        placeholder="Production Company"
                        value={profileData.company}
                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      className="input-creative min-h-[100px]"
                      placeholder="Tell us about yourself and your writing background..."
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="btn-creative">
                    Save Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card className="card-creative">
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Choose your preferred AI service and configure your API settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleApiSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-medium">AI Service Provider</Label>
                    <RadioGroup
                      value={apiSettings.useOwnKey ? "own" : "ours"}
                      onValueChange={(value) => setApiSettings({ ...apiSettings, useOwnKey: value === "own" })}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2 p-4 border border-border/50 rounded-lg hover:border-primary/50 transition-colors">
                        <RadioGroupItem value="ours" id="ours" />
                        <div className="flex-1">
                          <Label htmlFor="ours" className="font-medium">Use ScriptAI's OpenAI Credits</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            We provide OpenAI access with our credits. Simple and hassle-free.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-4 border border-border/50 rounded-lg hover:border-primary/50 transition-colors">
                        <RadioGroupItem value="own" id="own" />
                        <div className="flex-1">
                          <Label htmlFor="own" className="font-medium">Use Your Own OpenAI API Key</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Connect your personal OpenAI account for unlimited usage and full control.
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {apiSettings.useOwnKey && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="space-y-2">
                        <Label htmlFor="apiKey">OpenAI API Key</Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="apiKey"
                            type={showApiKey ? "text" : "password"}
                            className="input-creative pl-10 pr-10"
                            placeholder="sk-..."
                            value={apiSettings.openaiKey}
                            onChange={(e) => setApiSettings({ ...apiSettings, openaiKey: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your API key is encrypted and stored securely. Get yours from{" "}
                          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-glow">
                            OpenAI Platform
                          </a>
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="keyActive">API Key Active</Label>
                          <p className="text-xs text-muted-foreground">
                            Enable or disable your API key usage
                          </p>
                        </div>
                        <Switch
                          id="keyActive"
                          checked={apiSettings.keyActive}
                          onCheckedChange={(checked) => setApiSettings({ ...apiSettings, keyActive: checked })}
                        />
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="btn-creative">
                    Save API Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="card-creative">
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>
                  Customize your ScriptAI experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and script generation
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-save Scripts</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your generated scripts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button className="btn-creative">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;