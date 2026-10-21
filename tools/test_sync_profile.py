import json
import html
import unittest
from pathlib import Path

from tools import sync_profile


ROOT = Path(__file__).resolve().parents[1]


class ProfileSyncTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.profile = sync_profile.load_profile(ROOT / "tools" / "profile.json")

    def test_current_work_lists_both_concurrent_roles_and_responsibilities(self):
        rendered = sync_profile.render_current_roles(self.profile)

        self.assertIn("PB Siddhartha College of Arts and Science", rendered)
        self.assertIn("Yes&amp;Yes Publications", rendered)
        self.assertIn("Content Writer", rendered)
        self.assertIn("Content drafting", rendered)
        self.assertIn("Data writing", rendered)
        self.assertIn("Ensuring data accuracy", rendered)
        self.assertNotIn("2026", rendered)

    def test_crawler_summary_states_the_additional_current_role(self):
        rendered = sync_profile.render_additional_roles(self.profile)

        self.assertIn("Content Writer", rendered)
        self.assertIn("Yes&amp;Yes Publications", rendered)
        self.assertIn("content drafting", rendered.lower())
        self.assertIn("data writing", rendered.lower())
        self.assertIn("ensuring data accuracy", rendered.lower())

    def test_technical_skills_render_as_static_semantic_lists(self):
        rendered = sync_profile.render_technical_skills(self.profile)

        for category in self.profile["technical_dna"]:
            self.assertIn(html.escape(category["label"]), rendered)
            self.assertIn("<ul", rendered)
            for skill in category["skills"]:
                self.assertIn(html.escape(skill), rendered)

    def test_generated_javascript_categories_use_the_same_profile_data(self):
        rendered = sync_profile.render_js_categories(self.profile)

        for category in self.profile["technical_dna"]:
            self.assertIn(category["label"].upper(), rendered)
            for skill in category["skills"]:
                self.assertIn(skill, rendered)

    def test_role_schema_is_consistent_on_profile_answers_and_home_pages(self):
        sync_profile.validate_profile_jsonld(self.profile, ROOT)


if __name__ == "__main__":
    unittest.main()
