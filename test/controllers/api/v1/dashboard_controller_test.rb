require "test_helper"

class Api::V1::DashboardControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_v1_dashboard_index_url
    assert_response :success
  end
end
