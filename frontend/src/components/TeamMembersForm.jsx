"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "./ui/badge";

export default function TeamMembersForm({ initialTeamMembers = [], onSubmit }) {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [memberName, setMemberName] = useState("");
  const [memberSkills, setMemberSkills] = useState("");
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const handleAddMember = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!memberName.trim()) newErrors.memberName = "Name is required";
    if (!memberSkills.trim()) newErrors.memberSkills = "Skills are required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newMember = {
      name: memberName.trim(),
      skills: memberSkills.split(",").map(skill => skill.trim())
    };

    setTeamMembers([...teamMembers, newMember]);
    setMemberName("");
    setMemberSkills("");
    setErrors({});
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/upload-resume", {  // Change URL if using another endpoint
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload resume: ${errorText}`);
      }

      const result = await response.json();
      console.log("Resume Parsing Response:", result);

      if (result.status === "success") {
        const newMember = {
          name: result.name,
          skills: result.skills
        };

        setTeamMembers([...teamMembers, newMember]);
      } else {
        alert("Error parsing resume. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (teamMembers.length === 0) {
      setErrors({ general: "Please add at least one team member" });
      return;
    }
    onSubmit(teamMembers);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Team Members</h2>
      <p className="text-gray-600 mb-6">Add team members manually or upload a resume</p>

      {/* Upload Resume */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resume (PDF, DOCX)</label>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleResumeUpload}
          disabled={uploading}
          className="mb-4"
        />
        {uploading && <p className="text-sm text-blue-500">Uploading and processing resume...</p>}
      </div>

      {/* Add Member Manually */}
      <form onSubmit={handleAddMember} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Member Name</label>
          <input
            type="text"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            placeholder="Enter member name"
            className={`w-full px-4 py-2 border rounded-md ${errors.memberName ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.memberName && <p className="mt-1 text-sm text-red-500">{errors.memberName}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
          <input
            type="text"
            value={memberSkills}
            onChange={(e) => setMemberSkills(e.target.value)}
            placeholder="e.g., Python, AI, Machine Learning"
            className={`w-full px-4 py-2 border rounded-md ${errors.memberSkills ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.memberSkills && <p className="mt-1 text-sm text-red-500">{errors.memberSkills}</p>}
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Member
        </button>
      </form>

      {/* Display Added Members */}
      {teamMembers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Added Members ({teamMembers.length})</h3>
          <div className="space-y-3">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex justify-between items-start p-3 bg-white rounded-lg border">
                <div>
                  <h4 className="font-medium">{member.name}</h4>
                  <div>
                    {member.skills.map((skill, i) => (
                      <Badge key={i} variant="outline" className="mr-2">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== index))}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {errors.general && <p className="mt-1 text-sm text-red-500">{errors.general}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-md transition-colors"
      >
        Next
      </button>
    </div>
  );
}
