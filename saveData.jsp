<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@page import="java.io.PrintWriter"%>
<%@page import="java.util.Map" %>
<%@page import="java.util.HashMap" %>
<%@page import="bmlclf.DataUnit" %>
<%@page import="bmlclfimpl.DataUnitClf" %>
<%@page import="dalclf.AppFactoryClf" %>
<%@page import="bmlclf.DataModel" %>
<%@page import="org.json.JSONObject" %>
<%
	PrintWriter writer = response.getWriter();
	//Map<String,Object> usr = (Map<String, Object>) session.getAttribute("usrs");
	String accNo = request.getParameter("accNo");
	String data = request.getParameter("data");
	//Long menu_id = Long.valueOf(request.getParameter("menu_id"));
	String rtn = "";
	
	//先寫死
	//accNo = "SYS";
	try {
		//AppFactoryClf.instanceJson2DataModel("WEBDEV",1,data);
		//HttpSession se = request.getSession();
		//rtn = AppFactoryClf.getInstance().gateJsonSaveModel(Long.valueOf(usr.get("USRS_ID").toString()),menu_id,accNo,data,usr.get("USRS_NM").toString());
		rtn = AppFactoryClf.instanceJsonSaveDataModel(accNo,data,0,"admin");
		writer.write(rtn);
	} catch (Exception e) {
		rtn = e.getMessage();
		if(rtn == null || rtn == ""){rtn = e.toString();}
		writer.write(rtn);
		e.printStackTrace();
	}finally{
		writer.close();
	}
%>